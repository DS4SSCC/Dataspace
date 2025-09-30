/**
 * Zet HTML-tekst om naar platte tekst door alle HTML-tags te verwijderen.
 * @param htmlString - De input string die HTML kan bevatten.
 * @returns De string met alleen platte tekst.
 */
export function stripHtmlTags(htmlString: string): string {
    // Maak een tijdelijk DOM-element aan (werkt in browser context)
    // const tempDiv = document.createElement("div");
    // tempDiv.innerHTML = htmlString;
    // return tempDiv.textContent || tempDiv.innerText || "";

    // Veiligere manier zonder DOM manipulatie, met behulp van reguliere expressie:
    // Deze regex zoekt naar '<...>' patronen en vervangt ze door een lege string.
    // Dit is een eenvoudige benadering en werkt goed voor standaard HTML.
    return htmlString.replace(/<[^>]*>/g, '');
}

/**
 * Zet HTML-tekst om naar platte tekst en verwijdert extra witruimte.
 * @param htmlString - De input string die HTML kan bevatten.
 * @returns De opgeschoonde platte tekst.
 */
export function sanitizeHtmlToPlainText(htmlString: string): string {
    // Verwijder HTML-tags
    let plainText = stripHtmlTags(htmlString);
    // Verwijder extra witruimte (spaties, tabs, nieuwe regels) en trim
    plainText = plainText.replace(/\s+/g, ' ').trim();
    return plainText;
}
