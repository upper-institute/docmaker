/// <reference types="node" />
import * as handlebars from 'handlebars';
import { MJMLParsingOptions, MJMLParseError } from 'mjml-core';
import puppeteer from 'puppeteer';
export interface RenderHTMLOptions {
    mjml: MJMLParsingOptions;
    handlebars: handlebars.RuntimeOptions;
}
export declare class RenderError extends Error {
    mjmlErrors: MJMLParseError[];
    constructor(message: string);
}
export declare function renderHTMLFromTemplate<T extends any>(html: string, vars?: T, options?: RenderHTMLOptions): string;
export interface RenderPDFOptions extends puppeteer.LaunchOptions {
    browser?: puppeteer.Browser;
    launchOptions?: puppeteer.BrowserLaunchArgumentOptions & puppeteer.LaunchOptions & puppeteer.BrowserConnectOptions & {
        product?: puppeteer.Product;
        extraPrefsFirefox?: Record<string, unknown>;
    };
    pageLoadTimeout?: number;
    pdfOptions?: puppeteer.PDFOptions;
}
export declare function renderPDFFromHTML(html: string, options?: RenderPDFOptions): Promise<Buffer>;
export declare function renderPDFFromTemplate<T extends any>(html: string, vars?: T, options?: RenderHTMLOptions & RenderPDFOptions): Promise<Buffer>;
//# sourceMappingURL=index.d.ts.map