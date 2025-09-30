// Importeer het type van een van je adapters (bijv. ODS) of definieer het gedeeld
import type { DcatApDataset, DcatApDistribution } from '../adapters/opendatasoft/types'; // Pas het pad aan als nodig

// Type definitie voor de input data (de gegeven voorbeeldstructuur)
interface InputDataset {
    "@id": string;
    "@type": string;
    "dct:title": string;
    "dct:description": string;
    "dct:publisher": {
        "@id": string;
        "@type": string;
        "foaf:name": string;
    };
    "dct:issued": string; // ISO 8601
    "dct:modified": string; // ISO 8601
    "dct:accrualPeriodicity"?: string;
    "dct:language"?: string;
    "dct:license"?: string;
    "dct:isPartOf"?: string;
    "dcat:theme": string;
    "dcat:keyword": string[];
    "dcat:contactPoint"?: {
        "@type": string;
        "vcard:fn": string;
        "vcard:hasEmail": string;
    };
    "dcat:distribution": InputDistribution[];
}

interface InputDistribution {
    "@id": string;
    "@type": string;
    "dct:title": string;
    "dct:description": string;
    "dct:format": string;
    "dcat:accessURL": string;
    "dcat:downloadURL"?: string;
}

/**
 * Converteert een enkele dataset van de gegeven JSON-LD stijl naar het DcatApDataset formaat.
 * @param inputDataset - De input dataset in de specifieke JSON-LD stijl.
 * @returns Een object dat voldoet aan de DcatApDataset interface.
 */
function convertSingleDataset(inputDataset: InputDataset): DcatApDataset {
    // Maak een URI van het theme veld (bijv. 'sector-mobility' -> 'http://example.org/theme/sector-mobility')
    const themeUri = `http://example.org/theme/${encodeURIComponent(inputDataset["dcat:theme"])}`;

    // Verwijder HTML-tags uit de beschrijving
    const descriptionWithoutHtml = sanitizeHtmlToPlainText(inputDataset["dct:description"]);

    // Verwijder spaties aan het begin en einde van URL's
    const contactEmail = inputDataset["dcat:contactPoint"]?.["vcard:hasEmail"]?.trim();
    const contactName = inputDataset["dcat:contactPoint"]?.["vcard:fn"];

    return {
        id: inputDataset["@id"],
        title: inputDataset["dct:title"],
        description: descriptionWithoutHtml,
        issued: inputDataset["dct:issued"], // Veronderstel dat het al ISO 8601 formaat is
        modified: inputDataset["dct:modified"], // Veronderstel dat het al ISO 8601 formaat is
        publisher: {
            id: inputDataset["dct:publisher"]["@id"],
            name: inputDataset["dct:publisher"]["foaf:name"]
        },
        themes: [themeUri], // Converteer enkelvoudige theme naar array
        keywords: inputDataset["dcat:keyword"] || [],
        landingPage: inputDataset["dct:isPartOf"] ? `#${inputDataset["dct:isPartOf"]}` : undefined, // Of een relevante URL afleiden
        contactPoint: contactEmail ? `${contactName} (${contactEmail})` : undefined, // Combineer naam en e-mail
        distributions: inputDataset["dcat:distribution"].map(dist => {
            // Probeer het mediaType te verkrijgen uit dct:format (bijv. 'http://publications.europa.eu/resource/authority/file-type/CSV')
            // Dit is een eenvoudige mapping, je kunt dit uitbreiden
            const formatUri = dist["dct:format"];
            const mediaType = formatUri ? formatUri.split('/').pop()?.toLowerCase() || 'application/octet-stream' : 'application/octet-stream';
            const mappedMediaType = mapFormatUriToMediaType(mediaType);

            // Verwijder spaties aan het begin en einde van URL's
            const accessUrl = dist["dcat:accessURL"]?.trim();
            const downloadUrl = dist["dcat:downloadURL"]?.trim();

            return {
                id: dist["@id"],
                title: dist["dct:title"],
                description: dist["dct:description"],
                accessUrl: accessUrl || '', // Of gooi een fout als het verplicht is
                downloadUrl: downloadUrl, // Optioneel
                mediaType: mappedMediaType,
                format: formatUri.split('/').pop() || '', // Laatste deel van de URI als formaat
                // byteSize is niet aanwezig in de input, dus wordt weggelaten
            };
        })
    };
}

/**
 * Eenvoudige mapping van bekende formaten naar media types.
 * @param format - De laatste segment van een dct:format URI of een standaard formaat.
 * @returns Het bijbehorende IANA media type.
 */
function mapFormatUriToMediaType(format: string): string {
    const map: Record<string, string> = {
        'CSV': 'text/csv',
        'JSON': 'application/json',
        'JSON_LD': 'application/ld+json',
        'JSONLD': 'application/ld+json', // Mogelijke variant
        'TURTLE': 'text/turtle',
        'RDF_XML': 'application/rdf+xml',
        'RDFXML': 'application/rdf+xml', // Mogelijke variant
        'N3': 'text/n3',
        'N_QUADS': 'application/n-quads',
        'NQ': 'application/n-quads', // Mogelijke variant
        'N_TRIPLES': 'application/n-triples',
        'NT': 'application/n-triples', // Mogelijke variant
        'XML': 'application/xml',
        'XLSX': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'XLS': 'application/vnd.ms-excel',
        'ZIP': 'application/zip',
        'PDF': 'application/pdf',
        'HTML': 'text/html',
        'TXT': 'text/plain',
        // Voeg meer toe indien nodig
    };
    return map[format.toUpperCase()] || 'application/octet-stream';
}

/**
 * Zet HTML-tekst om naar platte tekst door alle HTML-tags te verwijderen.
 * @param htmlString - De input string die HTML kan bevatten.
 * @returns De string met alleen platte tekst.
 */
function sanitizeHtmlToPlainText(htmlString: string): string {
    // Gebruik een eenvoudige regex om tags te verwijderen
    // Dit is een basisimplementatie, voor complexe HTML is een bibliotheek beter
    return htmlString.replace(/<[^>]*>/g, '');
}

/**
 * Converteert een array van datasets van de gegeven JSON-LD stijl naar het DcatApDataset formaat.
 * @param inputDatasets - De input array van datasets.
 * @returns Een array van objecten die voldoen aan de DcatApDataset interface.
 */
export function convertDcatJsonLdToDcatAp(inputDatasets: InputDataset[]): DcatApDataset[] {
    return inputDatasets.map(dataset => convertSingleDataset(dataset));
}

// Voorbeeldgebruik:
/*
const inputArray = [ ... ]; // Jouw gegeven array
const convertedArray = convertDcatJsonLdToDcatAp(inputArray);
console.log(JSON.stringify(convertedArray, null, 2)); // Log om te bekijken
*/

const dcat_datasets = [
    {
        "@id": "dataset-mobility-001",
        "@type": "dcat:Dataset",
        "dct:title": "Public Transport Timetables",
        "dct:description": "Real-time and scheduled timetables for buses, trams and metros.",
        "dct:publisher": {
            "@id": "org-ret",
            "@type": "foaf:Agent",
            "foaf:name": "RET Rotterdam"
        },
        "dct:issued": "2024-01-15",
        "dct:modified": "2025-09-01",
        "dcat:theme": "sector-mobility",
        "dcat:keyword": ["transport", "mobility", "timetable"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/continuous",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "RET Data Team",
            "vcard:hasEmail": "mailto:data@ret.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-mobility-001-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Public Transport Timetables",
                "dct:description": "Downloadable CSV file containing the public transport timetables.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://api.ret.nl/realtime",
                "dcat:downloadURL": "https://api.ret.nl/realtime?format=csv"
            }
        ],
        "dct:isPartOf": "catalog-rotterdam"
    },
    {
        "@id": "dataset-energy-002",
        "@type": "dcat:Dataset",
        "dct:title": "Public Charging Stations",
        "dct:description": "Locations, availability and capacity of public EV charging stations.",
        "dct:publisher": {
            "@id": "org-elaadnl",
            "@type": "foaf:Agent",
            "foaf:name": "ElaadNL"
        },
        "dct:issued": "2023-05-01",
        "dct:modified": "2025-08-20",
        "dcat:theme": "sector-energy",
        "dcat:keyword": ["energy", "ev", "charging stations"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "ElaadNL Support",
            "vcard:hasEmail": "mailto:support@elaad.nl"
        },
        "dcat:distribution": [
            {
                "@id":
                    "dist-energy-002-csv",
                "@type":
                    "dcat:Distribution",
                "dct:title":
                    "CSV Distribution of Public Charging Stations",
                "dct:description":
                    "Downloadable CSV file containing the locations and details of public charging stations.",
                "dct:format":
                    "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL":
                    "https://laadpaaldata.elaad.nl",
                "dcat:downloadURL":
                    "https://laadpaaldata.elaad.nl/export.csv"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    },
    {
        "@id": "dataset-environment-003",
        "@type": "dcat:Dataset",
        "dct:title": "Air Quality Monitoring",
        "dct:description": "Real-time and historical data on air quality and pollution levels.",
        "dct:publisher": {
            "@id": "org-rivm",
            "@type": "foaf:Agent",
            "foaf:name": "RIVM"
        },
        "dct:issued": "2021-03-01",
        "dct:modified": "2025-08-15",
        "dcat:theme": "sector-environment",
        "dcat:keyword": ["air quality", "environment", "pollution"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/continuous",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "RIVM Data Team",
            "vcard:hasEmail": "mailto:info@rivm.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-environment-003-api",
                "@type": "dcat:Distribution",
                "dct:title": "API Distribution of Air Quality Monitoring",
                "dct:description": "API endpoint providing real-time and historical air quality data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://www.luchtmeetnet.nl/",
                "dcat:downloadURL": "https://api.luchtmeetnet.nl/v1/data"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    },
    {
        "@id": "dataset-waste-004",
        "@type": "dcat:Dataset",
        "dct:title": "Waste Collection Schedule",
        "dct:description": "Garbage pickup schedule and container locations in Rotterdam.",
        "dct:publisher": {
            "@id": "org-rotterdam",
            "@type": "foaf:Agent",
            "foaf:name": "Gemeente Rotterdam"
        },
        "dct:issued": "2022-01-01",
        "dct:modified": "2025-07-30",
        "dcat:theme": "sector-waste",
        "dcat:keyword": ["waste", "collection", "recycling"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/annual",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Gemeente Rotterdam Data Team",
            "vcard:hasEmail": "mailto:opendata@rotterdam.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-waste-004-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Waste Collection Schedule",
                "dct:description": "Downloadable CSV file containing the waste collection schedule.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://www.rotterdam.nl/afval",
                "dcat:downloadURL": "https://www.rotterdam.nl/afval/export.csv"
            }
        ],
        "dct:isPartOf": "catalog-rotterdam"
    },
    {
        "@id": "dataset-health-005",
        "@type": "dcat:Dataset",
        "dct:title": "Hospital Capacity Statistics",
        "dct:description": "Occupancy rates, ICU beds and hospital capacity data.",
        "dct:publisher": {
            "@id": "org-nza",
            "@type": "foaf:Agent",
            "foaf:name": "NZa"
        },
        "dct:issued": "2024-11-01",
        "dct:modified": "2025-08-25",
        "dcat:theme": "sector-health",
        "dcat:keyword": ["health", "hospital", "capacity"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "NZa Data Team",
            "vcard:hasEmail": "mailto:info@nza.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-health-005-api",
                "@type": "dcat:Distribution",
                "dct:title": "API Distribution of Hospital Capacity Statistics",
                "dct:description": "API endpoint providing hospital capacity statistics.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://opendata.nza.nl",
                "dcat:downloadURL": "https://opendata.nza.nl/api/v1/hospital-capacity"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    },
    {
        "@id": "dataset-safety-006",
        "@type": "dcat:Dataset",
        "dct:title": "Crime Statistics Rotterdam",
        "dct:description": "Monthly reports of incidents and crimes per neighborhood.",
        "dct:publisher": {
            "@id": "org-police",
            "@type": "foaf:Agent",
            "foaf:name": "Politie Nederland"
        },
        "dct:issued": "2022-09-01",
        "dct:modified": "2025-08-25",
        "dcat:theme": "sector-safety",
        "dcat:keyword": ["safety", "crime", "statistics"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Politie Nederland Data Team",
            "vcard:hasEmail": "mailto:opendata@politie.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-safety-006-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Crime Statistics Rotterdam",
                "dct:description": "Downloadable JSON file containing crime statistics.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.politie.nl",
                "dcat:downloadURL": "https://data.politie.nl/crime-rotterdam.json"
            }
        ],
        "dct:isPartOf": "catalog-rotterdam"
    },
    {
        "@id": "dataset-housing-007",
        "@type": "dcat:Dataset",
        "dct:title": "Housing Prices and Availability",
        "dct:description": "Monthly statistics about housing availability, rental prices and sales data.",
        "dct:publisher": {
            "@id": "org-cbs",
            "@type": "foaf:Agent",
            "foaf:name": "Centraal Bureau voor de Statistiek"
        },
        "dct:issued": "2022-01-01",
        "dct:modified": "2025-08-01",
        "dcat:theme": "sector-housing",
        "dcat:keyword": ["housing", "real estate", "prices"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "CBS Data Team",
            "vcard:hasEmail": "mailto:info@cbs.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-housing-007-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Housing Prices and Availability",
                "dct:description": "Downloadable CSV file containing housing statistics.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://data.example.org/housing/prices.csv",
                "dcat:downloadURL": "https://data.example.org/housing/prices.csv"
            }
        ],
        "dct:isPartOf": "catalog-rotterdam"
    },
    {
        "@id": "dataset-economy-008",
        "@type": "dcat:Dataset",
        "dct:title": "Retail Sales Statistics",
        "dct:description": "Monthly sales and revenue data for retail stores in the Netherlands.",
        "dct:publisher": {
            "@id": "org-cbs",
            "@type": "foaf:Agent",
            "foaf:name": "Centraal Bureau voor de Statistiek"
        },
        "dct:issued": "2023-01-01",
        "dct:modified": "2025-08-20",
        "dcat:theme": "sector-economy",
        "dcat:keyword": ["economy", "retail", "sales"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "CBS Data Team",
            "vcard:hasEmail": "mailto:info@cbs.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-economy-008-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Retail Sales Statistics",
                "dct:description": "Downloadable CSV file containing retail sales statistics.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://opendata.cbs.nl/retail",
                "dcat:downloadURL": "https://opendata.cbs.nl/retail/export.csv"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    },
    {
        "@id": "dataset-culture-009",
        "@type": "dcat:Dataset",
        "dct:title": "Museum Collections Online",
        "dct:description": "Digital access to collections from museums in the Netherlands.",
        "dct:publisher": {
            "@id": "org-europeana",
            "@type": "foaf:Agent",
            "foaf:name": "Europeana Foundation"
        },
        "dct:issued": "2020-10-15",
        "dct:modified": "2025-07-22",
        "dcat:theme": "sector-culture",
        "dcat:keyword": ["culture", "museum", "heritage"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/irregular",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Europeana Data Team",
            "vcard:hasEmail": "mailto:info@europeana.eu"
        },
        "dcat:distribution": [
            {
                "@id": "dist-culture-009-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON-LD Distribution of Museum Collections Online",
                "dct:description": "Downloadable JSON-LD file containing museum collection data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON_LD",
                "dcat:accessURL": "https://www.europeana.eu",
                "dcat:downloadURL": "https://www.europeana.eu/api/v2/search.json"
            }
        ],
        "dct:isPartOf": "catalog-culture"
    },
    {
        "@id": "dataset-governance-010",
        "@type": "dcat:Dataset",
        "dct:title": "City Council Meetings",
        "dct:description": "Agendas, motions and decisions of the Rotterdam city council.",
        "dct:publisher": {
            "@id": "org-rotterdam",
            "@type": "foaf:Agent",
            "foaf:name": "Gemeente Rotterdam"
        },
        "dct:issued": "2021-01-01",
        "dct:modified": "2025-08-01",
        "dcat:theme": "sector-governance",
        "dcat:keyword": ["governance", "municipality", "politics"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/weekly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Gemeente Rotterdam Data Team",
            "vcard:hasEmail": "mailto:opendata@rotterdam.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-governance-010-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of City Council Meetings",
                "dct:description": "Downloadable JSON file containing city council meeting data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://raad.rotterdam.nl",
                "dcat:downloadURL": "https://raad.rotterdam.nl/api/v1/meetings.json"
            }
        ],
        "dct:isPartOf": "catalog-rotterdam"
    },
    {
        "@id": "dataset-mobility-011",
        "@type": "dcat:Dataset",
        "dct:title": "Car Sharing Locations",
        "dct:description": "Locations and availability of shared cars in Rotterdam.",
        "dct:publisher": {
            "@id": "org-greenwheels",
            "@type": "foaf:Agent",
            "foaf:name": "Greenwheels"
        },
        "dct:issued": "2023-03-01",
        "dct:modified": "2025-07-20",
        "dcat:theme": "sector-mobility",
        "dcat:keyword": ["cars", "mobility", "sharing"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/continuous",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Greenwheels Data Team",
            "vcard:hasEmail": "mailto:api@greenwheels.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-mobility-011-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Car Sharing Locations",
                "dct:description": "API endpoint providing real-time car sharing locations.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://api.greenwheels.nl/cars",
                "dcat:downloadURL": "https://api.greenwheels.nl/cars/locations"
            }
        ],
        "dct:isPartOf": "catalog-amsterdam"
    },
    {
        "@id": "dataset-energy-012",
        "@type": "dcat:Dataset",
        "dct:title": "Solar Panel Production",
        "dct:description": "Electricity production from solar panels on commercial buildings.",
        "dct:publisher": {
            "@id": "org-solartech",
            "@type": "foaf:Agent",
            "foaf:name": "SolarTech BV"
        },
        "dct:issued": "2024-01-01",
        "dct:modified": "2025-08-10",
        "dcat:theme": "sector-energy",
        "dcat:keyword": ["energy", "solar", "production"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "SolarTech Data Team",
            "vcard:hasEmail": "mailto:data@solartech.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-energy-012-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Solar Panel Production",
                "dct:description": "Downloadable CSV file containing solar panel production data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://data.solartech.nl/production.csv",
                "dcat:downloadURL": "https://data.solartech.nl/production.csv"
            }
        ],
        "dct:isPartOf": "catalog-private"
    },
    {
        "@id": "dataset-environment-013",
        "@type": "dcat:Dataset",
        "dct:title": "Noise Pollution Levels",
        "dct:description": "Noise measurements near major roads and industrial areas.",
        "dct:publisher": {
            "@id": "org-rijkswaterstaat",
            "@type": "foaf:Agent",
            "foaf:name": "Rijkswaterstaat"
        },
        "dct:issued": "2022-05-01",
        "dct:modified": "2025-08-05",
        "dcat:theme": "sector-environment",
        "dcat:keyword": ["noise", "pollution", "environment"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Rijkswaterstaat Data Team",
            "vcard:hasEmail": "mailto:info@rws.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-environment-013-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Noise Pollution Levels",
                "dct:description": "Downloadable JSON file containing noise pollution data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.rijkswaterstaat.nl/noise",
                "dcat:downloadURL": "https://data.rijkswaterstaat.nl/noise/export.json"
            }
        ],
        "dct:isPartOf": "catalog-eindhoven"
    },
    {
        "@id": "dataset-health-015",
        "@type": "dcat:Dataset",
        "dct:title": "Vaccination Rates by Region",
        "dct:description": "Vaccination coverage statistics for different regions in the Netherlands.",
        "dct:publisher": {
            "@id": "org-ggd",
            "@type": "foaf:Agent",
            "foaf:name": "GGD Nederland"
        },
        "dct:issued": "2022-11-01",
        "dct:modified": "2025-08-18",
        "dcat:theme": "sector-health",
        "dcat:keyword": ["health", "vaccination", "statistics"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/weekly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "GGD Data Team",
            "vcard:hasEmail": "mailto:info@ggd.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-health-015-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Vaccination Rates by Region",
                "dct:description": "Downloadable CSV file containing vaccination rate data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://data.ggd.nl/vaccination",
                "dcat:downloadURL": "https://data.ggd.nl/vaccination/export.csv"
            }
        ],
        "dct:isPartOf": "catalog-eindhoven"
    },
    {
        "@id": "dataset-safety-016",
        "@type": "dcat:Dataset",
        "dct:title": "Fire Incident Reports",
        "dct:description": "Records of fire incidents reported across different municipalities.",
        "dct:publisher": {
            "@id": "org-brandweer",
            "@type": "foaf:Agent",
            "foaf:name": "Brandweer Nederland"
        },
        "dct:issued": "2021-01-01",
        "dct:modified": "2025-08-12",
        "dcat:theme": "sector-safety",
        "dcat:keyword": ["safety", "fire", "incidents"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Brandweer Nederland Data Team",
            "vcard:hasEmail": "mailto:info@brandweer.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-safety-016-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Fire Incident Reports",
                "dct:description": "Downloadable JSON file containing fire incident reports.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.brandweer.nl/incidents",
                "dcat:downloadURL": "https://data.brandweer.nl/incidents/export.json"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    },
    {
        "@id": "dataset-housing-017",
        "@type": "dcat:Dataset",
        "dct:title": "Rental Prices by City",
        "dct:description": "Monthly average rental prices for different cities in the Netherlands.",
        "dct:publisher": {
            "@id": "org-pararius",
            "@type": "foaf:Agent",
            "foaf:name": "Pararius BV"
        },
        "dct:issued": "2023-01-01",
        "dct:modified": "2025-08-22",
        "dcat:theme": "sector-housing",
        "dcat:keyword": ["housing", "rental", "prices"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Pararius Data Team",
            "vcard:hasEmail": "mailto:api@pararius.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-housing-017-csv",
                "@type": "dcat:Distribution",
                "dct:title": "CSV Distribution of Rental Prices by City",
                "dct:description": "Downloadable CSV file containing rental price data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV",
                "dcat:accessURL": "https://data.pararius.nl/rent",
                "dcat:downloadURL": "https://data.pararius.nl/rent/export.csv"
            }
        ],
        "dct:isPartOf": "catalog-utrecht"
    },
    {
        "@id": "dataset-economy-018",
        "@type": "dcat:Dataset",
        "dct:title": "Startup Activity by Region",
        "dct:description": "Number and types of startups per region.",
        "dct:publisher": {
            "@id": "org-startupsnl",
            "@type": "foaf:Agent",
            "foaf:name": "StartupsNL"
        },
        "dct:issued": "2022-05-01",
        "dct:modified": "2025-07-30",
        "dcat:theme": "sector-economy",
        "dcat:keyword": ["economy", "startups", "business"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "StartupsNL Data Team",
            "vcard:hasEmail": "mailto:info@startups.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-economy-018-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Startup Activity by Region",
                "dct:description": "Downloadable JSON file containing startup activity data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.startupnl.nl/regions",
                "dcat:downloadURL": "https://data.startupnl.nl/regions/export.json"
            }
        ],
        "dct:isPartOf": "catalog-utrecht"
    },
    {
        "@id": "dataset-culture-019",
        "@type": "dcat:Dataset",
        "dct:title": "Concert Venues and Events",
        "dct:description": "Information about concert venues and scheduled music events in the Netherlands.",
        "dct:publisher": {
            "@id": "org-musicnl",
            "@type": "foaf:Agent",
            "foaf:name": "MusicNL"
        },
        "dct:issued": "2023-06-01",
        "dct:modified": "2025-08-14",
        "dcat:theme": "sector-culture",
        "dcat:keyword": ["culture", "music", "events"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/daily",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "MusicNL Data Team",
            "vcard:hasEmail": "mailto:info@musicnl.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-culture-019-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Concert Venues and Events",
                "dct:description": "Downloadable JSON file containing concert venue and event data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.musicnl.nl/events",
                "dcat:downloadURL": "https://data.musicnl.nl/events/export.json"
            }
        ],
        "dct:isPartOf": "catalog-amsterdam"
    },
    {
        "@id": "dataset-governance-020",
        "@type": "dcat:Dataset",
        "dct:title": "Open Government Spending",
        "dct:description": "Monthly expenditure reports of different governmental departments.",
        "dct:publisher": {
            "@id": "org-govnl",
            "@type": "foaf:Agent",
            "foaf:name": "Government NL"
        },
        "dct:issued": "2022-01-01",
        "dct:modified": "2025-08-20",
        "dcat:theme": "sector-governance",
        "dcat:keyword": ["governance", "transparency", "spending"],
        "dct:accrualPeriodicity": "http://purl.org/cld/freq/monthly",
        "dct:language": "http://id.loc.gov/vocabulary/iso639-1/nl",
        "dct:license": "http://publications.europa.eu/resource/authority/licence/CC_BY_4_0",
        "dcat:contactPoint": {
            "@type": "vcard:Kind",
            "vcard:fn": "Government NL Data Team",
            "vcard:hasEmail": "mailto:opendata@overheid.nl"
        },
        "dcat:distribution": [
            {
                "@id": "dist-governance-020-json",
                "@type": "dcat:Distribution",
                "dct:title": "JSON Distribution of Open Government Spending",
                "dct:description": "Downloadable JSON file containing government spending data.",
                "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON",
                "dcat:accessURL": "https://data.overheid.nl/spending",
                "dcat:downloadURL": "https://data.overheid.nl/spending/export.json"
            }
        ],
        "dct:isPartOf": "catalog-nationaal"
    }
]

export const databaseTemp = {
    datasets: convertDcatJsonLdToDcatAp(dcat_datasets),
    sectors: [
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
        }
    ],

    catalogs: [
        {
            "@id": "catalog-eindhoven",
            "@type": "dcat:Catalog",
            "dct:title": "Open Data Eindhoven",
            "dct:description": "Datasets published by the municipality of Eindhoven.",
            "dct:publisher": {
                "@id": "org-eindhoven",
                "@type": "foaf:Agent",
                "foaf:name": "Gemeente Eindhoven"
            },
            "dct:issued": "2021-01-01",
            "dct:modified": "2025-08-20",
            "dcat:dataset": [
                "dataset-mobility-001",
                "dataset-environment-013",
                "dataset-health-015"
            ],
            "dcat:landingPage": "https://opendata.eindhoven.nl",
            "dcat:service": [
                {
                    "@id": "service-eindhoven-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Eindhoven Open Data API",
                    "dct:description": "API service for accessing Eindhoven open data.",
                    "dcat:endpointURL": "https://api.eindhoven.nl/v1",
                    "dcat:endpointDescription": "https://api.eindhoven.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON"
                }
            ]
        },
        {
            "@id": "catalog-rotterdam",
            "@type": "dcat:Catalog",
            "dct:title": "Open Data Rotterdam",
            "dct:description": "Datasets published by the municipality of Rotterdam.",
            "dct:publisher": {
                "@id": "org-rotterdam",
                "@type": "foaf:Agent",
                "foaf:name": "Gemeente Rotterdam"
            },
            "dct:issued": "2020-01-01",
            "dct:modified": "2025-08-25",
            "dcat:dataset": [
                "dataset-waste-004",
                "dataset-safety-006",
                "dataset-housing-007",
                "dataset-governance-010"
            ],
            "dcat:landingPage": "https://data.rotterdam.nl",
            "dcat:service": [
                {
                    "@id": "service-rotterdam-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Rotterdam Open Data API",
                    "dct:description": "API service for accessing Rotterdam open data.",
                    "dcat:endpointURL": "https://api.rotterdam.nl/v1",
                    "dcat:endpointDescription": "https://api.rotterdam.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON"
                }
            ]
        },
        {
            "@id": "catalog-amsterdam",
            "@type": "dcat:Catalog",
            "dct:title": "Open Data Amsterdam",
            "dct:description": "Datasets published by the municipality of Amsterdam.",
            "dct:publisher": {
                "@id": "org-amsterdam",
                "@type": "foaf:Agent",
                "foaf:name": "Gemeente Amsterdam"
            },
            "dct:issued": "2019-01-01",
            "dct:modified": "2025-08-15",
            "dcat:dataset": [
                "dataset-mobility-011",
                "dataset-culture-019"
            ],
            "dcat:landingPage": "https://data.amsterdam.nl",
            "dcat:service": [
                {
                    "@id": "service-amsterdam-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Amsterdam Open Data API",
                    "dct:description": "API service for accessing Amsterdam open data.",
                    "dcat:endpointURL": "https://api.amsterdam.nl/v1",
                    "dcat:endpointDescription": "https://api.amsterdam.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON"
                }
            ]
        },
        {
            "@id": "catalog-utrecht",
            "@type": "dcat:Catalog",
            "dct:title": "Open Data Utrecht",
            "dct:description": "Datasets published by the municipality of Utrecht.",
            "dct:publisher": {
                "@id": "org-utrecht",
                "@type": "foaf:Agent",
                "foaf:name": "Gemeente Utrecht"
            },
            "dct:issued": "2021-01-01",
            "dct:modified": "2025-08-10",
            "dcat:dataset": [
                "dataset-housing-017",
                "dataset-economy-018"
            ],
            "dcat:landingPage": "https://data.utrecht.nl",
            "dcat:service": [
                {
                    "@id": "service-utrecht-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Utrecht Open Data API",
                    "dct:description": "API service for accessing Utrecht open data.",
                    "dcat:endpointURL": "https://api.utrecht.nl/v1",
                    "dcat:endpointDescription": "https://api.utrecht.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON"
                }
            ]
        },
        {
            "@id": "catalog-nationaal",
            "@type": "dcat:Catalog",
            "dct:title": "Nationale Open Data Catalogus",
            "dct:description": "Centraal verzamelpunt voor open data van nationale instanties in Nederland.",
            "dct:publisher": {
                "@id": "org-govnl",
                "@type": "foaf:Agent",
                "foaf:name": "Rijksdienst voor Ondernemend Nederland"
            },
            "dct:issued": "2018-01-01",
            "dct:modified": "2025-08-25",
            "dcat:dataset": [
                "dataset-energy-002",
                "dataset-environment-003",
                "dataset-health-005",
                "dataset-economy-008",
                "dataset-safety-016",
                "dataset-governance-020"
            ],
            "dcat:landingPage": "https://data.overheid.nl",
            "dcat:service": [
                {
                    "@id": "service-nationaal-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Nationale Open Data API",
                    "dct:description": "API service voor toegang tot nationale open data.",
                    "dcat:endpointURL": "https://api.overheid.nl/v1",
                    "dcat:endpointDescription": "https://api.overheid.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON"
                }
            ]
        },
        {
            "@id": "catalog-culture",
            "@type": "dcat:Catalog",
            "dct:title": "Culturele Open Data Catalogus",
            "dct:description": "Catalogus met datasets over cultuur en kunst.",
            "dct:publisher": {
                "@id": "org-europeana",
                "@type": "foaf:Agent",
                "foaf:name": "Europeana Foundation"
            },
            "dct:issued": "2020-01-01",
            "dct:modified": "2025-07-22",
            "dcat:dataset": [
                "dataset-culture-009"
            ],
            "dcat:landingPage": "https://www.europeana.eu",
            "dcat:service": [
                {
                    "@id": "service-culture-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Culturele Open Data API",
                    "dct:description": "API service voor toegang tot culturele open data.",
                    "dcat:endpointURL": "https://api.europeana.eu/v2",
                    "dcat:endpointDescription": "https://api.europeana.eu/v2/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/JSON_LD"
                }
            ]
        },
        {
            "@id": "catalog-private",
            "@type": "dcat:Catalog",
            "dct:title": "Private Sector Open Data Catalogus",
            "dct:description": "Catalogus met datasets van private bedrijven.",
            "dct:publisher": {
                "@id": "org-solartech",
                "@type": "foaf:Agent",
                "foaf:name": "SolarTech BV"
            },
            "dct:issued": "2024-01-01",
            "dct:modified": "2025-08-10",
            "dcat:dataset": [
                "dataset-energy-012"
            ],
            "dcat:landingPage": "https://www.solartech.nl",
            "dcat:service": [
                {
                    "@id": "service-private-api",
                    "@type": "dcat:DataService",
                    "dct:title": "Private Sector Open Data API",
                    "dct:description": "API service voor toegang tot open data van het private sector.",
                    "dcat:endpointURL": "https://api.solartech.nl/v1",
                    "dcat:endpointDescription": "https://api.solartech.nl/v1/docs",
                    "dct:format": "http://publications.europa.eu/resource/authority/file-type/CSV"
                }
            ]
        }
    ]
}
