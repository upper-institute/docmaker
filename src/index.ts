
import * as handlebars from 'handlebars';
import mjml2html from 'mjml';
import { MJMLParsingOptions, MJMLParseResults, MJMLParseError } from 'mjml-core';
import puppeteer from 'puppeteer';

export interface RenderHTMLOptions {
    mjml: MJMLParsingOptions,
    handlebars: handlebars.RuntimeOptions,
};

export class RenderError extends Error {

    public mjmlErrors: MJMLParseError[] = [];

    constructor(message: string) {
        super(message);
        this.name = 'RenderError';
    }

}

export function renderHTMLFromTemplate<T extends any>(html: string, vars?: T, options?: RenderHTMLOptions): string {

    vars = vars || {} as any;
    options = options || {
        mjml: {},
        handlebars: {},
    };

    const template = handlebars.compile(html);

    let parsed: MJMLParseResults;

    try {

        parsed = mjml2html(template(vars, options.handlebars), options.mjml);

    } catch (error) {
        
        if (error instanceof Error) {
            throw new RenderError(error.message)
        }

        throw error;

    }

    if (parsed.errors.length) {

        const error = new RenderError('Found MJML errors from parsing operation');

        error.mjmlErrors = parsed.errors;

        throw error;

    }

    return parsed.html;

}

export interface RenderPDFOptions extends puppeteer.LaunchOptions {
    browser?: puppeteer.Browser;
    launchOptions?: puppeteer.BrowserLaunchArgumentOptions & puppeteer.LaunchOptions & puppeteer.BrowserConnectOptions & {
        product?: puppeteer.Product;
        extraPrefsFirefox?: Record<string, unknown>;
    };
    pageLoadTimeout?: number;
    pdfOptions?: puppeteer.PDFOptions;
}

export async function renderPDFFromHTML(html: string, options?: RenderPDFOptions): Promise<Buffer> {
    
    options = options || {};

    const browser = options.browser || await puppeteer.launch({
        ...options.launchOptions,
        headless: true,
    });

    const page = await browser.newPage();

    await page.setContent(html, {waitUntil: 'networkidle0', timeout: options.pageLoadTimeout || 0});

    await page.emulateMediaType('print');

    const pdf = await page.pdf(options.pdfOptions || { format: 'a4', timeout: 10000, printBackground: true });

    if (!options.browser) {
        await browser.close();
    }

    return pdf;

}

export async function renderPDFFromTemplate<T extends any>(html: string, vars?: T, options?: RenderHTMLOptions & RenderPDFOptions): Promise<Buffer> {

    return await renderPDFFromHTML(renderHTMLFromTemplate(html, vars, options), options);

}