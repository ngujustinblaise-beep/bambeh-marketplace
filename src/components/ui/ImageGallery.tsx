import { useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Zoom } from 'swiper/modules';
import { X, ZoomIn, ZoomOut, ChevronLeft, ChevronRight } from 'lucide-react';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import 'swiper/css/zoom';

interface ImageGalleryProps {
  images: string[];
  initialSlide?: number;
  onClose?: () => void;
}

const ImageGallery = ({ images, initialSlide = 0, onClose }: ImageGalleryProps) => {
  const [currentIndex, setCurrentIndex] = useState(initialSlide);
  const [isFullscreen, setIsFullscreen] = useState(false);

  return (
    <>
      {/* Normal Gallery View */}
      <div className="relative">
        <Swiper
          modules={[Navigation, Pagination, Zoom]}
          spaceBetween={10}
          slidesPerView={1}
          navigation={{ prevEl: '.swiper-button-prev-custom',
            nextEl: '.swiper-button-next-custom'
          }}
          pagination={{
            clickable: true,
            dynamicBullets: true
          }}
          zoom={true}
          initialSlide={initialSlide}
          onSlideChange={(swiper) => setCurrentIndex(swiper.activeIndex)}
          className="rounded-lg overflow-hidden"
        >
          {images.map((image, index) => (
            <SwiperSlide key={index}>
              <div className="swiper-zoom-container">
                <img
                  src={image}
                  alt={`Slide ${index + 1}`}
                  className="w-full h-auto object-cover cursor-pointer"
                  onClick={() => setIsFullscreen(true)}
                />
              </div>
            </SwiperSlide>
          ))}
        </Swiper>

        {/* Custom Navigation Buttons */}
        {images.length > 1 && (
          <>
            <button
              className="swiper-button-prev-custom absolute left-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Previous image"
            >
              <ChevronLeft className="w-6 h-6 text-gray-800" />
            </button>
            <button
              className="swiper-button-next-custom absolute right-2 top-1/2 -translate-y-1/2 z-10 bg-white/90 hover:bg-white rounded-full p-2 shadow-lg transition-all"
              aria-label="Next image"
            >
              <ChevronRight className="w-6 h-6 text-gray-800" />
            </button>
          </>
        )},
        {/* Image Counter */}
        {images.length > 1 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 bg-black/70 text-white px-3 py-1 rounded-full text-sm">
            {currentIndex + 1} / {images.length}
          </div>
        )},
        {/* Zoom Hint */}
        <div className="absolute top-4 right-4 z-10 bg-black/70 text-white px-3 py-2 rounded-lg text-xs flex items-center gap-2">
          <ZoomIn className="w-4 h-4" />
          <span>Pinch to zoom</span>
        </div>
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 bg-black z-50 flex items-center justify-center">
          {/* Close Button */}
          <button
            onClick={() => setIsFullscreen(false)}
            className="absolute top-4 right-4 z-20 bg-white/20 hover:bg-white/30 rounded-full p-2 transition-colors"
          >
            <X className="w-6 h-6 text-white" />
          </button>

          {/* Fullscreen Swiper */}
          <Swiper
            modules={[Navigation, Pagination, Zoom]}
            spaceBetween={0}
            slidesPerView={1}
            navigation
            pagination={{ clickable: true }}
            zoom={{ maxRatio: 3 }}
            initialSlide={currentIndex}
            className="w-full h-full"
          >
            {images.map((image, index) => (
              <SwiperSlide key={index} className="flex items-center justify-center">
                <div className="swiper-zoom-container">
                  <img
                    src={image}
                    alt={`Slide ${index + 1}`}
                    className="max-w-full max-h-full object-contain"
                  />
                </div>
              </SwiperSlide>
            ))}
          </Swiper>

          {/* Fullscreen Controls */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex items-center gap-4">
            <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-full text-white text-sm">
              Pinch or double-tap to zoom
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ImageGallery;





