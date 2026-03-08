#!/bin/bash
# Build ver.2.0.1.1.txt by combining all output files in proper order
# Format: version header, then each container (S/O + AP), then MASTER data

BASE="$(dirname "$0")"
OUTPUT_DIR="$BASE/output"
OUTFILE="$BASE/ver.2.0.1.1.txt"

# Container order (035 after 030)
CONTAINERS="010 020 030 035 040 050 060 070 080 090 100 110 120 130 140 150 160 170 180 190 200 210 220 230 240 250 260 270 280 290 300 310 320 330 340 350 360 400 510 600 700"

# Extract content between header block and footer block
# Header: everything up to and including the 2nd ================================================================ line
# Footer: everything from ---------------------------------------------------------------- to end
extract_content() {
    local file="$1"
    awk '
    BEGIN { in_header=1; eq_count=0 }
    /^================================================================$/ {
        eq_count++
        if (eq_count <= 2) { next }
    }
    eq_count >= 2 && in_header { in_header=0 }
    in_header { next }
    /^----------------------------------------------------------------$/ { exit }
    { print }
    ' "$file"
}

# Start with version header
echo "ver.2.0.1.1" > "$OUTFILE"
echo "" >> "$OUTFILE"

# For each container: header, S/O files, then AP files
for c in $CONTAINERS; do
    so1="$OUTPUT_DIR/${c}-SO-01.txt"
    if [ ! -f "$so1" ]; then
        echo "WARNING: $so1 not found, skipping container $c" >&2
        continue
    fi

    # Extract container name from header
    container_name=$(grep "^コンテナ:" "$so1" | sed 's/コンテナ: No\.[0-9]* - //')

    echo "================================================================" >> "$OUTFILE"
    echo "【No.${c}】${container_name}" >> "$OUTFILE"
    echo "================================================================" >> "$OUTFILE"

    # Append S/O files with separator between blocks
    for so_file in $(ls "$OUTPUT_DIR/${c}-SO-"*.txt 2>/dev/null | sort); do
        extract_content "$so_file" >> "$OUTFILE"
        echo "" >> "$OUTFILE"
        echo "--------------------------------" >> "$OUTFILE"
        echo "" >> "$OUTFILE"
    done

    # Append AP files with separator between blocks
    for ap_file in $(ls "$OUTPUT_DIR/${c}-AP-"*.txt 2>/dev/null | sort -t'-' -k3 -n); do
        extract_content "$ap_file" >> "$OUTFILE"
        echo "" >> "$OUTFILE"
        echo "--------------------------------" >> "$OUTFILE"
        echo "" >> "$OUTFILE"
    done
done

# MASTER data section
echo "" >> "$OUTFILE"
echo "================================================================" >> "$OUTFILE"
echo "【マスターデータ】" >> "$OUTFILE"
echo "================================================================" >> "$OUTFILE"
echo "" >> "$OUTFILE"

# MASTER files in order
for master in \
    "01-MASTER-CONTAINER-CLASSIFICATION.txt" \
    "02-DIAGNOSTIC-PROTOCOL-ROS-MAP.txt" \
    "04-MASTER-THERAPEUTIC-ITEMS.txt" \
    "05-MASTER-CATEGORY1-MEDICATIONS.txt" \
    "06-MASTER-CATEGORY2-TESTS.txt" \
    "07-MASTER-CATEGORY3-PROCEDURES.txt" \
    "08-MASTER-CATEGORY4-DOCUMENTS.txt"; do

    mfile="$OUTPUT_DIR/$master"
    if [ -f "$mfile" ]; then
        extract_content "$mfile" >> "$OUTFILE"
        echo "" >> "$OUTFILE"
    fi
done

# Squeeze consecutive blank lines (2+ blank lines → 1 blank line)
TMPFILE="$OUTFILE.tmp"
awk '
/^$/ { blank++; if (blank <= 1) print; next }
{ blank=0; print }
' "$OUTFILE" > "$TMPFILE" && mv "$TMPFILE" "$OUTFILE"

lines=$(wc -l < "$OUTFILE")
size=$(wc -c < "$OUTFILE")
echo "Generated: $OUTFILE"
echo "Lines: $lines, Size: $size bytes"
