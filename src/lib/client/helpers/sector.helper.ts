// lib/shared/utils/sector-mapping.utils.ts

export interface Sector {
    id: string;
    name: string;
    description: string;
}
// Definieer je standaard sectors
export const SECTORS: Sector[] = [
    {
        "id": "sector-mobility",
        "name": "Mobility & Transport",
        "description": "Datasets related to mobility, public transport, traffic and shared mobility services."
    },
    {
        "id": "sector-energy",
        "name": "Energy & Sustainability",
        "description": "Datasets on renewable energy, consumption, energy grids and sustainable initiatives."
    },
    {
        "id": "sector-environment",
        "name": "Environment & Climate",
        "description": "Air quality, noise levels, green spaces, climate adaptation and related datasets."
    },
    {
        "id": "sector-waste",
        "name": "Waste & Circularity",
        "description": "Waste management, recycling, circular economy and container locations."
    },
    {
        "id": "sector-health",
        "name": "Health & Wellbeing",
        "description": "Public health, hospital capacity, wellbeing statistics and health initiatives."
    },
    {
        "id": "sector-safety",
        "name": "Safety & Security",
        "description": "Crime statistics, emergency response, public safety and smart surveillance."
    },
    {
        "id": "sector-housing",
        "name": "Housing & Urban Development",
        "description": "Datasets on housing, real estate, urban planning and zoning."
    },
    {
        "id": "sector-economy",
        "name": "Economy & Innovation",
        "description": "Local economy, startups, employment, business activity and innovation hubs."
    },
    {
        "id": "sector-culture",
        "name": "Culture & Education",
        "description": "Museums, cultural events, education, schools and universities."
    },
    {
        "id": "sector-governance",
        "name": "Governance & Participation",
        "description": "Datasets about open government, citizen participation and policy transparency."
    },
    {
        "id": "sector-debugging",
        "name": "Test & Debugging",
        "description": "Datasets used for testing and debugging purposes."
    }
];

// Mapping van mogelijke waarden (URI delen, keywords, etc.) naar de interne sector ID
const SECTOR_MAPPING: Record<string, string> = {
    // Mobility & Transport
    "Verkeer": "sector-mobility",
    "Ruimte en infrastructuur": "sector-mobility",
    "ruimte-en-infrastructuur": "sector-mobility",
    "Transport": "sector-mobility",
    "Mobility": "sector-mobility",
    "Traffic": "sector-mobility",
    "Public Transport": "sector-mobility",
    "Buses": "sector-mobility",
    "Trams": "sector-mobility",
    "Metros": "sector-mobility",
    "Car Sharing": "sector-mobility",

    // Energy & Sustainability
    "Energie": "sector-energy",
    "Energy": "sector-energy",
    "Sustainability": "sector-energy",
    "Renewable Energy": "sector-energy",
    "Solar": "sector-energy",
    "Wind": "sector-energy",
    "Consumption": "sector-energy",

    // Environment & Climate
    "Natuur en milieu": "sector-environment",
    "natuur-en-milieu": "sector-environment",
    "Environment": "sector-environment",
    "Climate": "sector-environment",
    "Air Quality": "sector-environment",
    "Lucht": "sector-environment",
    "Noise": "sector-environment",
    "Geluid": "sector-environment",
    "Green Spaces": "sector-environment",
    "Nature": "sector-environment",


    // Waste & Circularity
    "Huishoudelijk afval": "sector-waste", // Specifiek voor Rotterdam
    "Waste": "sector-waste",
    "Afval": "sector-waste",
    "Recycling": "sector-waste",
    "Circularity": "sector-waste",
    "Circular Economy": "sector-waste",
    "Waste Management": "sector-waste",

    // Health & Wellbeing
    "Zorg en Gezondheid": "sector-health",
    "zorg-en-gezondheid": "sector-health",
    "Health": "sector-health",
    "Wellbeing": "sector-health",
    "Hospital": "sector-health",
    "Vaccination": "sector-health",
    "Gezondheid": "sector-health",

    // Safety & Security
    "Openbare orde en veiligheid": "sector-safety",
    "Safety": "sector-safety",
    "Security": "sector-safety",
    "Crime": "sector-safety",
    "Criminaliteit": "sector-safety",
    "Police": "sector-safety",
    "Brandweer": "sector-safety", // Fire department
    "Fire": "sector-safety",

    // Housing & Urban Development
    "Sociale zekerheid": "sector-housing",
    "Huisvesting": "sector-housing",
    "Housing": "sector-housing",
    "Urban Development": "sector-housing",
    "Urban Planning": "sector-housing",
    "Woningbouw": "sector-housing",
    "Rental": "sector-housing",
    "Rental Prices": "sector-housing",
    "Huur": "sector-housing",

    // Economy & Innovation
    "Economie": "sector-economy",
    "economie": "sector-economy",
    "Economy": "sector-economy",
    "Innovation": "sector-economy",
    "Startups": "sector-economy",
    "Business": "sector-economy",
    "Retail": "sector-economy",
    "Sales": "sector-economy",
    "Employment": "sector-economy",
    "werk": "sector-economy",

    // Culture & Education
    "Cultuur en recreatie": "sector-culture",
    "cultuur-en-recreatie": "sector-culture",
    "Culture": "sector-culture",
    "Recreation": "sector-culture",
    "Museums": "sector-culture",
    "Events": "sector-culture",
    "Concerts": "sector-culture",
    "Onderwijs en wetenschap": "sector-culture", // Onderwijs
    "onderwijs-en-wetenschap": "sector-culture",
    "Education": "sector-culture",
    "Schools": "sector-culture",
    "Universities": "sector-culture",

    // Governance & Participation
    "Recht": "sector-governance",
    "Bestuur": "sector-governance",
    "Governance": "sector-governance",
    "Participation": "sector-governance",
    "Open Government": "sector-governance",
    "Transparency": "sector-governance",
    "City Council": "sector-governance",
    "Raad": "sector-governance", // Dutch for Council
    "Politics": "sector-governance",
    "Government": "sector-governance",
    "Spending": "sector-governance",

    // debug
    "david": "sector-debugging"
};

/**
 * Haalt het thema deel uit een URI en probeert het te matchen met een sector.
 * Ondersteunt zowel externe labels (zoals 'Verkeer') als directe interne sector ID's (zoals 'sector-energy').
 * @param themeUri - De volledige theme URI (bijv. "http://example.org/theme/Verkeer") of een directe sector ID (bijv. "sector-energy").
 * @param sectors - De lijst van beschikbare sectors (standaard SECTORS).
 * @param mapping - De mapping om te gebruiken (standaard SECTOR_MAPPING).
 * @returns Een object met de oorspronkelijke input, het geëxtraheerde/de gedecondeerde thema deel, de gevonden sector (of null).
 */
export function mapThemeUriToSector(themeUri: string, sectors: Sector[] = SECTORS, mapping: Record<string, string> = SECTOR_MAPPING): { originalInput: string; extractedTheme: string | null; matchedSector: Sector | null } {
    let extractedTheme: string | null = null;
    let matchedSector: Sector | null = null;

    const url = new URL(themeUri ?? 'https://example.org/');
    const pathSegments = url.pathname.split('/');
    const lastSegment = pathSegments[pathSegments.length - 1];

    // Probeer eerst of de input zelf een geldige sector ID is
    const directSectorMatch = sectors.find(sector => sector.id === lastSegment);
    if (directSectorMatch) {
        // Als het een directe match is, is het de sector zelf
        return {
            originalInput: themeUri,
            extractedTheme: themeUri, // Of null als je aangeven wilt dat het niet uit een URI is gehaald
            matchedSector: directSectorMatch
        };
    }

    try {
        // 1. Parse de URI om het laatste deel te verkrijgen (alleen als het geen directe ID was)
        const url = new URL(themeUri);
        const pathSegments = url.pathname.split('/');
        const lastSegment = pathSegments[pathSegments.length - 1];

        if (lastSegment) {
            // 2. Decodeer eventuele URL-encoding (bijv. %20 naar spatie)
            extractedTheme = decodeURIComponent(lastSegment);

            // 3. Zoek de sector op basis van de geëxtraheerde en gedecodeerde waarde via de mapping
            // Eerst exacte hoofdlettergevoelige match
            const mappedId = mapping[extractedTheme];
            if (mappedId) {
                matchedSector = sectors.find(sector => sector.id === mappedId) || null;
            }

            // Dan hoofdletterongevoelige match als de exacte faalt
            if (!matchedSector) {
                const lowerCaseKey = extractedTheme.toLowerCase();
                const foundKey = Object.keys(mapping).find(k => k.toLowerCase() === lowerCaseKey);
                if (foundKey) {
                    const mappedIdFromLower = mapping[foundKey];
                    matchedSector = sectors.find(sector => sector.id === mappedIdFromLower) || null;
                }
            }
            if (!matchedSector && extractedTheme) {
                // Only in development, or based on a debug flag
                console.warn(`[Sector Mapping] Unmapped theme: "${extractedTheme}" from URI: "${themeUri}"`);
            }
        }
    } catch (err) {
        // Als de URI ongeldig is (maar geen directe sector match), log het en zet extractedTheme op null
        // Als het geen geldige URI is en ook geen directe sector ID, is het een onbekende input
        if (!directSectorMatch) {
            console.error(`Invalid theme URI or unknown sector ID provided: ${themeUri}`, err);
        }
        // matchedSector blijft null
    }

    return {
        originalInput: themeUri, // Gebruik originalInput om het gedrag duidelijker te maken
        extractedTheme,
        matchedSector
    };
}

// Optionele hulpfunctie als je alleen de sector nodig hebt
export function getSectorFromThemeUriOrId(input: string): Sector | null {
    return mapThemeUriToSector(input).matchedSector;
}
