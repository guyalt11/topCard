export interface Language {
    code: string;
    name: string;
}

export const LANGUAGES: Language[] = [
    { code: 'en', name: 'English' },
    { code: 'al', name: 'Albanian' },
    { code: 'sa', name: 'Arabic' },
    { code: 'bd', name: 'Bengali' },
    { code: 'bg', name: 'Bulgarian' },
    { code: 'mm', name: 'Burmese' },
    { code: 'cn', name: 'Chinese' },
    { code: 'hr', name: 'Croatian' },
    { code: 'cz', name: 'Czech' },
    { code: 'dk', name: 'Danish' },
    { code: 'nl', name: 'Dutch' },
    { code: 'ee', name: 'Estonian' },
    { code: 'et', name: 'Ethiopian' },
    { code: 'fi', name: 'Finnish' },
    { code: 'fr', name: 'French' },
    { code: 'de', name: 'German' },
    { code: 'gr', name: 'Greek' },
    { code: 'he', name: 'Hebrew' },
    { code: 'in', name: 'Hindi' },
    { code: 'hu', name: 'Hungarian' },
    { code: 'is', name: 'Icelandic' },
    { code: 'id', name: 'Indonesian' },
    { code: 'it', name: 'Italian' },
    { code: 'ja', name: 'Japanese' },
    { code: 'kh', name: 'Khmer' },
    { code: 'kr', name: 'Korean' },
    { code: 'la', name: 'Lao' },
    { code: 'lv', name: 'Latvian' },
    { code: 'lt', name: 'Lithuanian' },
    { code: 'mk', name: 'Macedonian' },
    { code: 'my', name: 'Malay' },
    { code: 'mn', name: 'Mongolian' },
    { code: 'no', name: 'Norwegian' },
    { code: 'ir', name: 'Persian' },
    { code: 'pl', name: 'Polish' },
    { code: 'pt', name: 'Portuguese' },
    { code: 'ro', name: 'Romanian' },
    { code: 'ru', name: 'Russian' },
    { code: 'rs', name: 'Serbian' },
    { code: 'sk', name: 'Slovak' },
    { code: 'si', name: 'Slovenian' },
    { code: 'so', name: 'Somali' },
    { code: 'es', name: 'Spanish' },
    { code: 'tz', name: 'Swahili' },
    { code: 'se', name: 'Swedish' },
    { code: 'ph', name: 'Tagalog' },
    { code: 'th', name: 'Thai' },
    { code: 'tr', name: 'Turkish' },
    { code: 'ua', name: 'Ukrainian' },
    { code: 'pk', name: 'Urdu' },
    { code: 'vn', name: 'Vietnamese' },
    { code: 'za', name: 'Zulu' },
];

export const getLanguageName = (code: string): string => {
    const language = LANGUAGES.find(lang => lang.code === code);
    return language?.name || code;
};
