/**
 * Quickly transform a url into a markdown link
 * @param name URL name
 * @param url URL
 * @returns Markdown
 */
export function link(name: string, url: string): string {
    return `[${name}](${url})`;
}
