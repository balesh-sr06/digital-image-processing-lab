# Digital Image Processing Virtual Laboratory

## Overview
This project is a Digital Image Processing (DIP) Virtual Laboratory developed as part of an undergraduate engineering course.  
It provides an interactive platform to visualize and understand fundamental image processing algorithms through a step-by-step processing pipeline.

The objective is to bridge theoretical concepts of Digital Image Processing with practical implementation and visualization.

---

## Objectives
- To understand core Digital Image Processing concepts
- To visualize intermediate stages of image processing
- To study the effect of spatial domain operations on images
- To develop an academic-grade virtual laboratory
- To support laboratory evaluation and viva-voce examination

---

## Image Processing Pipeline

Input Image  
↓  
Grayscale Conversion  
↓  
Contrast Enhancement (Histogram Equalization)  
↓  
Noise Reduction (Gaussian Filtering)  
↓  
Edge Detection (Sobel Operator)  
↓  
Processed Output  

Each stage can be enabled or disabled independently for learning purposes.

---

## Algorithms Implemented

### Grayscale Conversion
RGB images are converted to grayscale using the luminosity method:  
I = 0.299R + 0.587G + 0.114B  

This method reflects human visual sensitivity to color channels.

---

### Contrast Enhancement
Histogram Equalization is applied to improve contrast by redistributing pixel intensities using the cumulative distribution function (CDF).

---

### Noise Reduction
Spatial filtering is performed using a Gaussian filter:
- Kernel size is adjustable
- Demonstrates convolution and smoothing effects
- Reduces noise while preserving image structure

---

### Edge Detection
Edges are detected using the Sobel operator:
- Computes horizontal and vertical gradients
- Gradient magnitude highlights object boundaries

---

## Features
- Image upload and preview
- Step-by-step processing visualization
- Toggle processing stages ON/OFF
- Adjustable filter parameters
- Display of intermediate outputs
- Clean academic user interface

---

## Technology Stack

Frontend:
- React (Vite)
- JavaScript (ES6)
- HTML5
- CSS / Tailwind CSS

Tools:
- Node.js
- npm
- Git & GitHub

---

## Project Structure

frontend/  
├── public/  
├── src/  
│   ├── App.jsx  
│   ├── App.css  
│   ├── index.css  
│   └── main.jsx  
├── index.html  
├── package.json  
├── tailwind.config.js  
├── postcss.config.js  
└── vite.config.js  

---

## How to Run the Project Locally

1. Clone the repository  
2. Navigate to the frontend folder  
3. Install dependencies using npm install  
4. Start the development server using npm run dev  
5. Open the browser at http://localhost:5173  

---

## Academic Relevance
This project aligns with the Digital Image Processing syllabus, covering:
- Image representation
- Grayscale transformations
- Histogram processing
- Spatial filtering
- Edge detection techniques

It is suitable for laboratory demonstrations, internal assessments, and viva examinations.

---

## Author
Developed as part of undergraduate engineering coursework for Digital Image Processing laboratory.
