"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.renderPDFFromTemplate = exports.renderPDFFromHTML = exports.renderHTMLFromTemplate = exports.RenderError = void 0;
const handlebars = __importStar(require("handlebars"));
const mjml_1 = __importDefault(require("mjml"));
const puppeteer_1 = __importDefault(require("puppeteer"));
;
class RenderError extends Error {
    constructor(message) {
        super(message);
        this.mjmlErrors = [];
        this.name = 'RenderError';
    }
}
exports.RenderError = RenderError;
function renderHTMLFromTemplate(html, vars, options) {
    vars = vars || {};
    options = options || {
        mjml: {},
        handlebars: {},
    };
    const template = handlebars.compile(html);
    let parsed;
    try {
        parsed = (0, mjml_1.default)(template(vars, options.handlebars), options.mjml);
    }
    catch (error) {
        if (error instanceof Error) {
            throw new RenderError(error.message);
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
exports.renderHTMLFromTemplate = renderHTMLFromTemplate;
async function renderPDFFromHTML(html, options) {
    options = options || {};
    const browser = options.browser || await puppeteer_1.default.launch({
        ...options.launchOptions,
        headless: true,
    });
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: 'networkidle0', timeout: options.pageLoadTimeout || 0 });
    await page.emulateMediaType('print');
    const pdf = await page.pdf(options.pdfOptions || { format: 'a4', timeout: 10000, printBackground: true });
    if (!options.browser) {
        await browser.close();
    }
    return pdf;
}
exports.renderPDFFromHTML = renderPDFFromHTML;
async function renderPDFFromTemplate(html, vars, options) {
    return await renderPDFFromHTML(renderHTMLFromTemplate(html, vars, options), options);
}
exports.renderPDFFromTemplate = renderPDFFromTemplate;
//# sourceMappingURL=index.js.map