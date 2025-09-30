/**
 * Zet een leesbare titel om naar een unieke, URL-vriendelijke naam.
 * Bijv. "Eindhoven Open Data Portal" -> "eindhoven-open-data-portal"
 * @param title - De leesbare titel.
 * @returns Een geformatteerde naam geschikt voor gebruik als unieke sleutel.
 */
export function titleToName(title: string): string {
    return title
        .toLowerCase() // Alles naar kleine letters
        .trim() // Verwijder spaties aan het begin en einde
        .replace(/[^\w\s-]/g, '') // Verwijder alle niet-alfanumerieke tekens, behalve spaties en streepjes
        .replace(/[\s_-]+/g, '-') // Vervang spaties, underscores en meerdere opeenvolgende streepjes door één streepje
        .replace(/^-+|-+$/g, ''); // Verwijder eventuele streepjes aan het begin of einde
}
