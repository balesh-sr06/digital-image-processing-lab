import React, { useState } from 'react';
import { Upload, Sliders, Download } from 'lucide-react';

const ImageProcessingLab = () => {
  const [originalImage, setOriginalImage] = useState(null);
  const [processedImage, setProcessedImage] = useState(null);
  const [intermediateImages, setIntermediateImages] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Processing parameters
  const [stages, setStages] = useState({
    grayscale: true,
    contrast: true,
    noise_reduction: true,
    edge_detection: true
  });
  
  const [params, setParams] = useState({
    filterType: 'gaussian',
    kernelSize: 5,
    edgeMethod: 'sobel',
    cannyLow: 50,
    cannyHigh: 150
  });

  // Image processing implementation (backend logic simulation)
  const processImageLocally = async (imageData) => {
    // Convert image to grayscale
    const rgbToGrayscale = (imageData) => {
      const data = imageData.data;
      for (let i = 0; i < data.length; i += 4) {
        const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        data[i] = gray;
        data[i + 1] = gray;
        data[i + 2] = gray;
      }
      return imageData;
    };

    // Histogram equalization
    const histogramEqualization = (imageData) => {
      const data = imageData.data;
      const histogram = new Array(256).fill(0);
      
      // Build histogram
      for (let i = 0; i < data.length; i += 4) {
        histogram[data[i]]++;
      }
      
      // Calculate CDF
      const cdf = new Array(256).fill(0);
      cdf[0] = histogram[0];
      for (let i = 1; i < 256; i++) {
        cdf[i] = cdf[i - 1] + histogram[i];
      }
      
      // Normalize CDF
      const totalPixels = imageData.width * imageData.height;
      const cdfMin = cdf.find(val => val > 0);
      const lookupTable = cdf.map(val => 
        Math.round(((val - cdfMin) / (totalPixels - cdfMin)) * 255)
      );
      
      // Apply equalization
      for (let i = 0; i < data.length; i += 4) {
        const newVal = lookupTable[data[i]];
        data[i] = newVal;
        data[i + 1] = newVal;
        data[i + 2] = newVal;
      }
      
      return imageData;
    };

    // Gaussian filter
    const applyGaussianFilter = (imageData, kernelSize) => {
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const output = new Uint8ClampedArray(data);
      
      // Generate Gaussian kernel
      const sigma = kernelSize / 6;
      const kernel = [];
      let sum = 0;
      const halfSize = Math.floor(kernelSize / 2);
      
      for (let y = -halfSize; y <= halfSize; y++) {
        const row = [];
        for (let x = -halfSize; x <= halfSize; x++) {
          const val = Math.exp(-(x * x + y * y) / (2 * sigma * sigma));
          row.push(val);
          sum += val;
        }
        kernel.push(row);
      }
      
      // Normalize kernel
      for (let i = 0; i < kernel.length; i++) {
        for (let j = 0; j < kernel[i].length; j++) {
          kernel[i][j] /= sum;
        }
      }
      
      // Apply convolution
      for (let y = halfSize; y < height - halfSize; y++) {
        for (let x = halfSize; x < width - halfSize; x++) {
          let val = 0;
          
          for (let ky = 0; ky < kernelSize; ky++) {
            for (let kx = 0; kx < kernelSize; kx++) {
              const py = y + ky - halfSize;
              const px = x + kx - halfSize;
              const idx = (py * width + px) * 4;
              val += data[idx] * kernel[ky][kx];
            }
          }
          
          const idx = (y * width + x) * 4;
          output[idx] = val;
          output[idx + 1] = val;
          output[idx + 2] = val;
        }
      }
      
      for (let i = 0; i < data.length; i++) {
        data[i] = output[i];
      }
      
      return imageData;
    };

    // Sobel edge detection
    const sobelEdgeDetection = (imageData) => {
      const data = imageData.data;
      const width = imageData.width;
      const height = imageData.height;
      const output = new Uint8ClampedArray(data.length);
      
      const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
      const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
      
      for (let y = 1; y < height - 1; y++) {
        for (let x = 1; x < width - 1; x++) {
          let gx = 0;
          let gy = 0;
          
          for (let ky = 0; ky < 3; ky++) {
            for (let kx = 0; kx < 3; kx++) {
              const py = y + ky - 1;
              const px = x + kx - 1;
              const idx = (py * width + px) * 4;
              const pixel = data[idx];
              
              gx += pixel * sobelX[ky][kx];
              gy += pixel * sobelY[ky][kx];
            }
          }
          
          const magnitude = Math.sqrt(gx * gx + gy * gy);
          const idx = (y * width + x) * 4;
          output[idx] = magnitude;
          output[idx + 1] = magnitude;
          output[idx + 2] = magnitude;
          output[idx + 3] = 255;
        }
      }
      
      for (let i = 0; i < data.length; i++) {
        data[i] = output[i];
      }
      
      return imageData;
    };

    // Process image through pipeline
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    const img = new window.Image();
    await new Promise((resolve) => {
      img.onload = resolve;
      img.src = imageData;
    });
    
    canvas.width = img.width;
    canvas.height = img.height;
    ctx.drawImage(img, 0, 0);
    
    let currentImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const intermediate = {};
    
    // Stage 1: Grayscale
    if (stages.grayscale) {
      currentImageData = rgbToGrayscale(currentImageData);
      ctx.putImageData(currentImageData, 0, 0);
      intermediate.grayscale = canvas.toDataURL();
    }
    
    // Stage 2: Contrast Enhancement
    if (stages.contrast) {
      currentImageData = histogramEqualization(currentImageData);
      ctx.putImageData(currentImageData, 0, 0);
      intermediate.enhanced = canvas.toDataURL();
    }
    
    // Stage 3: Noise Reduction
    if (stages.noise_reduction) {
      currentImageData = applyGaussianFilter(currentImageData, params.kernelSize);
      ctx.putImageData(currentImageData, 0, 0);
      intermediate.filtered = canvas.toDataURL();
    }
    
    // Stage 4: Edge Detection
    if (stages.edge_detection) {
      currentImageData = sobelEdgeDetection(currentImageData);
      ctx.putImageData(currentImageData, 0, 0);
    }
    
    return {
      processed: canvas.toDataURL(),
      intermediate
    };
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    if (!file.type.startsWith('image/')) {
      setError('Please upload a valid image file');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      setOriginalImage(event.target.result);
      setProcessedImage(null);
      setIntermediateImages({});
      setError('');
    };
    reader.readAsDataURL(file);
  };

  const handleProcess = async () => {
    if (!originalImage) {
      setError('Please upload an image first');
      return;
    }
    
    setLoading(true);
    setError('');
    
    try {
      const result = await processImageLocally(originalImage);
      setProcessedImage(result.processed);
      setIntermediateImages(result.intermediate);
    } catch (err) {
      setError('Error processing image: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = () => {
    if (!processedImage) return;
    
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = 'processed-image.png';
    link.click();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-100">
      <div className="container mx-auto px-4 py-8 max-w-7xl">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-blue-400 to-purple-500 bg-clip-text text-transparent">
            Digital Image Processing Laboratory
          </h1>
          <p className="text-gray-400">
            Grayscale Conversion → Contrast Enhancement → Noise Reduction → Edge Detection
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-1 bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
              <Sliders size={20} />
              Processing Controls
            </h2>
            
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">Upload Image</label>
              <div className="relative">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 file:cursor-pointer"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium mb-3">Pipeline Stages</label>
              <div className="space-y-2">
                {Object.entries(stages).map(([key, value]) => (
                  <label key={key} className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={value}
                      onChange={(e) => setStages({...stages, [key]: e.target.checked})}
                      className="w-4 h-4 rounded border-gray-600 bg-gray-700"
                    />
                    <span className="text-sm capitalize">
                      {key.replace('_', ' ')}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            {stages.noise_reduction && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Filter Type</label>
                <select
                  value={params.filterType}
                  onChange={(e) => setParams({...params, filterType: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="gaussian">Gaussian</option>
                  <option value="mean">Mean</option>
                  <option value="median">Median</option>
                </select>
              </div>
            )}

            {stages.noise_reduction && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">
                  Kernel Size: {params.kernelSize}
                </label>
                <input
                  type="range"
                  min="3"
                  max="11"
                  step="2"
                  value={params.kernelSize}
                  onChange={(e) => setParams({...params, kernelSize: parseInt(e.target.value)})}
                  className="w-full"
                />
              </div>
            )}

            {stages.edge_detection && (
              <div className="mb-6">
                <label className="block text-sm font-medium mb-2">Edge Method</label>
                <select
                  value={params.edgeMethod}
                  onChange={(e) => setParams({...params, edgeMethod: e.target.value})}
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-3 py-2 text-sm"
                >
                  <option value="sobel">Sobel</option>
                  <option value="canny">Canny</option>
                </select>
              </div>
            )}

            <div className="space-y-3">
              <button
                onClick={handleProcess}
                disabled={!originalImage || loading}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                {loading ? 'Processing...' : 'Process Image'}
              </button>
              
              {processedImage && (
                <button
                  onClick={handleDownload}
                  className="w-full bg-green-600 hover:bg-green-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center justify-center gap-2"
                >
                  <Download size={16} />
                  Download Result
                </button>
              )}
            </div>

            {error && (
              <div className="mt-4 p-3 bg-red-900/50 border border-red-700 rounded-lg text-sm text-red-200">
                {error}
              </div>
            )}
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Original Image</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  {originalImage ? (
                    <img src={originalImage} alt="Original" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center gap-2">
                      <Upload size={48} />
                      <span className="text-sm">Upload an image to begin</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-3">Processed Result</h3>
                <div className="bg-gray-900 rounded-lg overflow-hidden aspect-square flex items-center justify-center">
                  {processedImage ? (
                    <img src={processedImage} alt="Processed" className="max-w-full max-h-full object-contain" />
                  ) : (
                    <div className="text-gray-500 flex flex-col items-center gap-2">
                      <Sliders size={48} />
                      <span className="text-sm">Process image to see results</span>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {Object.keys(intermediateImages).length > 0 && (
              <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                <h3 className="text-lg font-semibold mb-4">Intermediate Processing Stages</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {intermediateImages.grayscale && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-300">Grayscale</p>
                      <div className="bg-gray-900 rounded overflow-hidden aspect-square">
                        <img src={intermediateImages.grayscale} alt="Grayscale" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                  {intermediateImages.enhanced && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-300">Enhanced Contrast</p>
                      <div className="bg-gray-900 rounded overflow-hidden aspect-square">
                        <img src={intermediateImages.enhanced} alt="Enhanced" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                  {intermediateImages.filtered && (
                    <div>
                      <p className="text-sm font-medium mb-2 text-gray-300">Noise Reduced</p>
                      <div className="bg-gray-900 rounded overflow-hidden aspect-square">
                        <img src={intermediateImages.filtered} alt="Filtered" className="w-full h-full object-contain" />
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold mb-3">Processing Pipeline Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div>
              <h4 className="font-medium text-blue-400 mb-1">Stage 1: Grayscale</h4>
              <p className="text-gray-400">Converts RGB to intensity using luminosity method: 0.299R + 0.587G + 0.114B</p>
            </div>
            <div>
              <h4 className="font-medium text-purple-400 mb-1">Stage 2: Enhancement</h4>
              <p className="text-gray-400">Histogram equalization redistributes pixel intensities for improved contrast</p>
            </div>
            <div>
              <h4 className="font-medium text-green-400 mb-1">Stage 3: Filtering</h4>
              <p className="text-gray-400">Spatial filtering reduces noise using convolution with selected kernel</p>
            </div>
            <div>
              <h4 className="font-medium text-orange-400 mb-1">Stage 4: Edge Detection</h4>
              <p className="text-gray-400">Gradient-based methods identify boundaries and significant transitions</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageProcessingLab;