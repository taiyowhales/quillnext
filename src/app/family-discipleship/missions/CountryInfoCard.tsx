import React from 'react';
import { createPortal } from 'react-dom';
import { X } from '@phosphor-icons/react';

interface CountryData {
    capital?: string;
    population?: string;
    continent?: string;
    _urban?: string;
    population_under_15_yrs?: string;
    life_expectancy?: string;
    official_language?: string;
    languages?: string;
    literacy_rate?: string;
    largest_religion?: string;
    _largest_religion?: string;
    _christian?: string;
    _evangelical?: string;
    people_groups?: string;
    least_reached_people_groups?: string;
    _unevangelized?: string;
    hdi_ranking?: string;
    persecution_ranking?: string;
    [key: string]: unknown;
}

interface CountryInfoData {
    country: string;
    url?: string;
    data: CountryData;
}

interface CountryInfoCardProps {
    countryData: CountryInfoData | null;
    isOpen: boolean;
    onClose: () => void;
}

export const CountryInfoCard = ({ countryData, isOpen, onClose }: CountryInfoCardProps) => {
    if (!isOpen || !countryData) return null;

    const { country, url, data } = countryData;

    const formatNumber = (numStr: string | undefined): string => {
        if (!numStr) return 'N/A';
        // Remove commas and parse, then add back commas
        const num = parseInt(numStr.replace(/,/g, ''));
        return isNaN(num) ? numStr : num.toLocaleString();
    };

    const formatPercentage = (percentStr: string | undefined): string => {
        if (!percentStr) return 'N/A';
        return percentStr;
    };

    return createPortal(
        <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-[9999] p-4 animate-in fade-in duration-200"
            onClick={onClose}
            role="dialog"
            aria-modal="true"
            aria-label="Country Information"
        >
            <div
                className="bg-white border-2 border-qc-gold/50 rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
                role="document"
            >
                {/* Header */}
                <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-100">
                    <h2 className="text-xl md:text-2xl font-bold text-qc-primary font-garamond">{country}</h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-qc-primary transition-colors p-2 rounded-full hover:bg-gray-100"
                        aria-label="Close"
                    >
                        <X size={24} weight="bold" />
                    </button>
                </div>

                {/* Content */}
                <div className="p-4 md:p-6 space-y-4 md:space-y-6">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-4">
                        <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                            <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">Basic Information</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Capital:</span>
                                    <span className="font-medium text-gray-900">{data.capital || 'N/A'}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Population:</span>
                                    <span className="font-medium text-gray-900">{formatNumber(data.population)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Continent:</span>
                                    <span className="font-medium text-gray-900">{data.continent || 'N/A'}</span>
                                </div>
                            </div>
                        </div>

                        <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                            <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">Demographics</h3>
                            <div className="space-y-2 text-sm">
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Urban Population:</span>
                                    <span className="font-medium text-gray-900">{formatPercentage(data._urban)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Under 15 Years:</span>
                                    <span className="font-medium text-gray-900">{formatPercentage(data.population_under_15_yrs)}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Life Expectancy:</span>
                                    <span className="font-medium text-gray-900">{data.life_expectancy || 'N/A'}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Language & Education */}
                    <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">Language & Education</h3>
                        <div className="space-y-2 text-sm">
                            <div>
                                <span className="text-gray-500">Official Language:</span>
                                <p className="font-medium text-gray-900 mt-1">{data.official_language || 'N/A'}</p>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-100">
                                <span className="text-gray-500">Total Languages:</span>
                                <span className="font-medium text-gray-900">{data.languages || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Literacy Rate:</span>
                                <span className="font-medium text-gray-900">{formatPercentage(data.literacy_rate)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Religion */}
                    <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">Religion</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Largest Religion:</span>
                                <span className="font-medium text-gray-900">{data.largest_religion || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Largest Religion %:</span>
                                <span className="font-medium text-gray-900">{formatPercentage(data._largest_religion)}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                                <span className="text-gray-500">Christian:</span>
                                <span className="font-medium text-gray-900">{formatPercentage(data._christian)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Evangelical:</span>
                                <span className="font-medium text-gray-900">{formatPercentage(data._evangelical)}</span>
                            </div>
                        </div>
                    </div>

                    {/* People Groups */}
                    <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">People Groups</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Total People Groups:</span>
                                <span className="font-medium text-gray-900">{data.people_groups || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-500">Least Reached Groups:</span>
                                <span className="font-medium text-gray-900">{data.least_reached_people_groups || 'N/A'}</span>
                            </div>
                            <div className="flex justify-between border-t border-gray-100 pt-2 mt-2">
                                <span className="text-gray-500">Unevangelized:</span>
                                <span className="font-medium text-gray-900">{formatPercentage(data._unevangelized)}</span>
                            </div>
                        </div>
                    </div>

                    {/* Rankings */}
                    <div className="bg-gray-50/50 border border-gray-100 rounded-lg p-3 md:p-4">
                        <h3 className="text-base md:text-lg font-semibold text-qc-primary mb-2 md:mb-3">Rankings</h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">HDI Ranking:</span>
                                <span className="font-medium text-gray-900">{data.hdi_ranking || 'N/A'}</span>
                            </div>
                            {data.persecution_ranking && (
                                <div className="flex justify-between">
                                    <span className="text-gray-500">Persecution Ranking:</span>
                                    <span className="font-medium text-red-600 font-semibold">{data.persecution_ranking}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Operation World Link */}
                    {url && (
                        <div className="pt-4 border-t border-gray-100">
                            <a
                                href={url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-qc-primary !text-white rounded-lg hover:bg-qc-primary/90 transition-colors font-medium text-sm"
                            >
                                View on Operation World
                                <svg className="ml-2 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                                </svg>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        </div>,
        document.body
    );
};
