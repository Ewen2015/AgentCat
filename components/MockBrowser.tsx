import React, { forwardRef, useImperativeHandle, useRef } from 'react';

interface MockBrowserProps {
  className?: string;
}

export interface MockBrowserHandle {
  getPageContent: () => string;
}

const MockBrowser = forwardRef<MockBrowserHandle, MockBrowserProps>(({ className }, ref) => {
  console.log('SideMate AI Agent: MockBrowser component rendering');
  const contentRef = useRef<HTMLDivElement>(null);

  useImperativeHandle(ref, () => ({
    getPageContent: () => {
      if (!contentRef.current) {
        console.warn('SideMate AI Agent: MockBrowser contentRef is null');
        return "";
      }
      // Return innerText to simulate reading the page content
      const content = contentRef.current.innerText;
      console.log('SideMate AI Agent: MockBrowser getPageContent called, returning content length:', content.length);
      return content;
    }
  }));

  return (
    <div className={`bg-white h-full flex flex-col ${className}`}>
      {/* 
        NOTE: Internal browser toolbar removed. 
        The parent App.tsx now handles the "Chrome" UI (URL bar, etc).
      */}

      {/* Mock Page Content */}
      <div ref={contentRef} className="flex-1 overflow-y-auto p-8 font-serif">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <header className="border-b pb-6">
            <span className="text-sm font-bold text-indigo-600 uppercase tracking-wider">New Arrival</span>
            <h1 className="text-4xl font-extrabold text-gray-900 mt-2">NeuroSound X1 Headphones</h1>
            <div className="flex items-center mt-4 space-x-4">
              <div className="flex text-yellow-500">★★★★★ <span className="text-gray-500 ml-1">(428 Reviews)</span></div>
              <span className="text-2xl font-bold text-gray-900">$349.00</span>
              <span className="bg-green-100 text-green-800 px-2 py-0.5 rounded text-xs font-medium">In Stock</span>
            </div>
          </header>

          {/* Product Image Placeholder */}
          <div className="w-full h-64 bg-gray-200 rounded-lg flex items-center justify-center overflow-hidden relative">
            <img 
               src="https://picsum.photos/800/400" 
               alt="Product" 
               className="object-cover w-full h-full opacity-80"
            />
            <div className="absolute inset-0 flex items-center justify-center">
                <span className="bg-black/50 text-white px-4 py-2 rounded">Product Visualization</span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            <button className="flex-1 bg-indigo-600 text-white py-3 px-6 rounded-lg font-bold hover:bg-indigo-700 transition">
              Add to Cart
            </button>
            <button className="flex-1 border border-gray-300 text-gray-700 py-3 px-6 rounded-lg font-bold hover:bg-gray-50 transition">
              Save to Wishlist
            </button>
          </div>

          {/* Description */}
          <section className="space-y-4">
            <h2 className="text-2xl font-bold text-gray-800">Product Description</h2>
            <p className="text-gray-600 leading-relaxed">
              Experience the future of audio with the NeuroSound X1. Featuring our proprietary Neural Adaptive Noise Cancellation technology, the X1 adapts to your environment 500 times per second. Whether you are on a busy subway or in a quiet library, the silence is pure.
            </p>
            <p className="text-gray-600 leading-relaxed">
              Crafted from aerospace-grade aluminum and premium memory foam, comfort is guaranteed for up to 30 hours of continuous playback. The X1 also supports multipoint pairing, allowing you to seamlessly switch between your laptop and smartphone.
            </p>
          </section>

          {/* Specs Table */}
          <section>
             <h2 className="text-2xl font-bold text-gray-800 mb-4">Technical Specifications</h2>
             <div className="border rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <tbody>
                    <tr className="border-b">
                      <td className="p-4 bg-gray-50 font-medium w-1/3">Battery Life</td>
                      <td className="p-4">30 Hours (ANC On) / 45 Hours (ANC Off)</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 bg-gray-50 font-medium">Drivers</td>
                      <td className="p-4">40mm Beryllium</td>
                    </tr>
                    <tr className="border-b">
                      <td className="p-4 bg-gray-50 font-medium">Connectivity</td>
                      <td className="p-4">Bluetooth 5.3, 3.5mm Aux, USB-C</td>
                    </tr>
                     <tr>
                      <td className="p-4 bg-gray-50 font-medium">Weight</td>
                      <td className="p-4">250g</td>
                    </tr>
                  </tbody>
                </table>
             </div>
          </section>

          {/* Reviews Snippet */}
          <section className="bg-gray-50 p-6 rounded-xl">
             <h3 className="text-lg font-bold mb-3">Top Critical Review</h3>
             <p className="text-sm text-gray-600 italic">"The sound is amazing, but the carrying case feels a bit cheap for the price point. Also, the app can be buggy on Android." - John Doe</p>
          </section>

           <div className="h-32"></div> {/* Spacer */}
        </div>
      </div>
    </div>
  );
});

export default MockBrowser;