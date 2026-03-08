#!/bin/bash
# Transform SO files: extract [ID:] from <O:> into new <Ns:> section
# Per update_ver.2.0.1.1 spec

OUTPUT_DIR="$(dirname "$0")/output"
count=0

for file in "$OUTPUT_DIR"/*-SO-*.txt; do
    # Skip files that have no [ID:] in their O section
    if ! awk '/^<O: 所見/,/^▶ Dr\.Advice|^-{30,}/' "$file" | grep -q '\[ID:'; then
        continue
    fi

    awk '
    BEGIN {
        state = "NORMAL"
        ns_count = 0
        cur_hdg = ""
        blank_buf = 0
    }

    # Detect O section start
    /^<O: 所見/ {
        state = "IN_O"
        cur_hdg = ""
        blank_buf = 0
        print
        next
    }

    state == "IN_O" && (/^▶ Dr\.Advice/ || /^-{30,}/) {
        # End of O section - insert Ns before Dr.Advice/footer
        if (ns_count > 0) {
            print ""
            print "<Ns: 診察前対応>:"
            prev_h = ""
            for (i = 1; i <= ns_count; i++) {
                if (ns_hdg[i] != "" && ns_hdg[i] != prev_h) {
                    print "    " ns_hdg[i]
                    prev_h = ns_hdg[i]
                }
                print "    " ns_ent[i]
            }
        }
        print ""
        state = "NORMAL"
        print
        next
    }

    state == "IN_O" {
        # Buffer blank lines
        if ($0 ~ /^[[:space:]]*$/) {
            blank_buf++
            next
        }
        # Flush one blank if buffered
        if (blank_buf > 0) {
            print ""
            blank_buf = 0
        }

        # Track headings
        if (match($0, /【[^】]+】/)) {
            cur_hdg = substr($0, RSTART, RLENGTH)
        }

        # Process [ID:] lines
        if ($0 ~ /\[ID: [^\]]+\]/) {
            # Get indent
            match($0, /^[[:space:]]*/)
            indent = substr($0, 1, RLENGTH)
            rest = substr($0, RLENGTH + 1)

            # Extract [ID: XXX]
            match(rest, /\[ID: [^\]]+\]/)
            id_str = substr(rest, RSTART, RLENGTH)
            after = substr(rest, RSTART + RLENGTH)
            sub(/^ /, "", after)

            # --- Ns side: name only (no results, annotations) ---
            ns_nm = after
            # Truncate at first " (" (half-width with space) or " ；"
            p1 = index(ns_nm, " (")
            p2 = index(ns_nm, " ；")
            cut = 0
            if (p1 > 0) cut = p1
            if (p2 > 0 && (cut == 0 || p2 < cut)) cut = p2
            if (cut > 0) ns_nm = substr(ns_nm, 1, cut - 1)

            ns_count++
            ns_ent[ns_count] = id_str " " ns_nm
            ns_hdg[ns_count] = cur_hdg

            # --- O side: remove [ID:], rename ---
            o_line = after
            gsub(/精密測定/, "検査", o_line)
            gsub(/定性/, "検査", o_line)
            gsub(/撮影/, "検査", o_line)

            print indent o_line
            next
        }

        # Regular O line - pass through
        print
        next
    }

    # Normal state
    { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"

    count=$((count + 1))
    echo "Transformed: $(basename "$file")"
done

echo "Total files transformed: $count"
