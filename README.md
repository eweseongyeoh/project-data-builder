# Project Data Builder

A solution that aims to produce project listing raw data from existing data sources like listing brochure.

## Solution Design
TBU

## Prerequisite/Installation

As the solution requires a number of tools and OS specific libraries to make it work, you will need to install/sign up for the following libraries/tools

### [PDF Util](https://github.com/zetahernandez/pdf-to-text)

Install one the following libraries based on your target operating system.

#### OSX

To begin on OSX, first make sure you have the homebrew package manager installed.

**pdftotext** is included as part on the xpdf utilities library. **xpdf** can be installed via homebrew

```bash
brew install xpdf
```

#### Ubuntu

**pdftotext** is included in the **poppler-utils** library. To installer poppler-utils execute

```bash
apt-get install poppler-utils
```

### [Textraction](https://www.textraction.ai)

Sign up for the AI tool and generate the `API_KEY` that is used in `.env` files.

## Usage

### PDF Crawler
TBU

### Image Extraction
TBU

### Text Extraction

Transform raw PDF data into useful project information. The following commands takes in a `.zip` folder containing the PDFs and outputs a `CSV` file, structured with the relevant properties.

```
npm run extract:text pdfs.zip
```
