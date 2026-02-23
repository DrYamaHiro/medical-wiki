import React, { useState } from 'react';
import clsx from 'clsx';
import Heading from '@theme/Heading';

interface MedicalEntryProps {
    diseaseName: string;
    icdCode: string;
    initialVisit?: {
        sText: string;
        oText: string;
        nsText: string;
        advice: string;
    };
    followupVisit?: {
        sText: string;
        oText: string;
        advice: string;
    };
    assessment: string;
    plan: string;
    drAdvice: string;
    children?: React.ReactNode;
}

const MedicalEntry: React.FC<MedicalEntryProps> = ({
    diseaseName,
    icdCode,
    initialVisit,
    followupVisit,
    assessment,
    plan,
    drAdvice,
    children,
}) => {
    const [showSO, setShowSO] = useState(false);
    const [showIds, setShowIds] = useState(false);
    const [visitType, setVisitType] = useState<'initial' | 'followup'>('initial');

    const formatText = (text: string) => {
        if (!text) return null;
        let processed = text;
        if (!showIds) {
            processed = processed.replace(/\[ID: .*?\]/g, '');
        }

        const lines = processed.split('\n');
        return lines.map((line, idx) => {
            if (line.trim().startsWith('【') && line.trim().endsWith('】')) {
                return <div key={idx} className="prescription-set-header">{line}</div>;
            }
            if (line.trim().startsWith('・') || line.trim().startsWith('-')) {
                return <div key={idx} className="prescription-item">{line}</div>;
            }
            return <div key={idx}>{line}</div>;
        });
    };

    return (
        <div className="medical-entry">
            <div className="view-controls margin-bottom--md">
                <button
                    className={clsx('button button--sm', showSO ? 'button--primary' : 'button--outline button--secondary')}
                    onClick={() => setShowSO(!showSO)}
                >
                    {showSO ? 'S/O 情報を隠す' : 'S/O 情報を表示'}
                </button>
                <button
                    className={clsx('button button--sm button--outline margin-left--sm', showIds ? 'button--warning' : 'button--secondary')}
                    onClick={() => setShowIds(!showIds)}
                >
                    {showIds ? 'IDを隠す' : 'IDを表示'}
                </button>
            </div>

            <div className="row">
                <div className="col col--7">
                    <div className="card shadow--md">
                        <div className="card__header">
                            <Heading as="h2">📝 診療テンプレート</Heading>
                            {showSO && (
                                <ul className="tabs tabs--block">
                                    <li className={clsx('tabs__item', visitType === 'initial' && 'tabs__item--active')} onClick={() => setVisitType('initial')}>初診 S/O</li>
                                    <li className={clsx('tabs__item', visitType === 'followup' && 'tabs__item--active')} onClick={() => setVisitType('followup')}>再診 S/O</li>
                                </ul>
                            )}
                        </div>
                        <div className="card__body">
                            {showSO && (
                                <div className="so-section margin-bottom--lg border--info padding--md">
                                    {visitType === 'initial' && initialVisit ? (
                                        <div className="visit-section">
                                            <h3>&lt;S: 主訴・ROS&gt;</h3>
                                            <div className="content-box">{formatText(initialVisit.sText)}</div>
                                            <h3>&lt;O: 所見・検査&gt;</h3>
                                            <div className="content-box">{formatText(initialVisit.oText)}</div>
                                            <h3>&lt;Ns: 診察前対応&gt;</h3>
                                            <div className="content-box">{formatText(initialVisit.nsText)}</div>
                                            {initialVisit.advice && <div className="admonition admonition-tip alert alert--success">{formatText(initialVisit.advice)}</div>}
                                        </div>
                                    ) : (
                                        followupVisit && (
                                            <div className="visit-section">
                                                <h3>&lt;S: 主訴・ROS&gt;</h3>
                                                <div className="content-box">{formatText(followupVisit.sText)}</div>
                                                <h3>&lt;O: 所見・検査&gt;</h3>
                                                <div className="content-box">{formatText(followupVisit.oText)}</div>
                                                {followupVisit.advice && <div className="admonition admonition-tip alert alert--success">{formatText(followupVisit.advice)}</div>}
                                            </div>
                                        )
                                    )}
                                    <div className="text--center">
                                        <button className="button button--link button--sm" onClick={() => setShowSO(false)}>▲ S/Oを閉じる</button>
                                    </div>
                                </div>
                            )}

                            <div className="ap-section">
                                <h3>&lt;A: 評価&gt;</h3>
                                <div className="content-box">{formatText(assessment)}</div>
                                <h3>&lt;P: 方針&gt;</h3>
                                <div className="content-box">{formatText(plan)}</div>
                                {drAdvice && <div className="admonition admonition-tip alert alert--success">{formatText(drAdvice)}</div>}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col col--5">
                    <Heading as="h2">📖 詳細解説</Heading>
                    <div className="wiki-area">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
};



export default MedicalEntry;
