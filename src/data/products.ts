export interface Product {
  id: string;
  name: string;
  category: 'Earbuds' | "Watch's" | 'Neckband' | 'Microphone' | 'Keyboard' | 'Humidifier' | 'Speakers' | string;
  price: number;
  originalPrice?: number;
  image: string;
  images?: string[];
  isFlashDeal?: boolean;
  isHot?: boolean;
  rating: number;
  reviewsCount: number;
  inStock: boolean;
  stock_quantity?: number;
  description: string;
  specs: Record<string, string>;
}

import neckbandImg from '../assets/images/wireless_neckband_1790917243979.jpg';
import catHeadsetImg from '../assets/images/cat_headset_1790917258021.jpg';
import smartWatchImg from '../assets/images/smart_watch_1790917269291.jpg';
import wirelessMicImg from '../assets/images/wireless_mic_1790917280320.jpg';
import bulbHumidifierImg from '../assets/images/bulb_humidifier_1790917290859.jpg';

export const PRODUCTS: Product[] = [
  {
    id: 'p1',
    name: 'Regrsi RE-NY060 wireless neckband',
    category: 'Neckband',
    price: 499,
    originalPrice: 750,
    image: neckbandImg,
    images: [
      neckbandImg,
      'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: true,
    rating: 4.8,
    reviewsCount: 142,
    inStock: true,
    description: 'High bass sports bluetooth wireless neckband with up to 200 hours standby time, magnetic earbuds, and crystal clear calling microphone.',
    specs: {
      'Playtime': 'Up to 24 Hours',
      'Standby': '200 Hours',
      'Bluetooth': 'v5.3 Fast Pair',
      'Water Resistance': 'IPX5 Sweatproof',
      'Charging': 'Type-C Quick Charge'
    }
  },
  {
    id: 'p2',
    name: 'Cat STN-28 multi-purpose wireless gaming headset',
    category: 'Earbuds',
    price: 499,
    originalPrice: 850,
    image: catHeadsetImg,
    images: [
      catHeadsetImg,
      'https://images.unsplash.com/photo-1613040809024-b4ef7ba99bc3?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: true,
    rating: 4.7,
    reviewsCount: 98,
    inStock: true,
    description: 'Foldable wireless RGB LED cat ear headphones for gaming, music, and streaming with HD mic and comfortable cushion padding.',
    specs: {
      'RGB Lights': 'Multi-color breathing LED',
      'Driver Unit': '40mm High Definition',
      'Connectivity': 'Bluetooth 5.0 + 3.5mm AUX',
      'Battery': '400mAh Rechargeable'
    }
  },
  {
    id: 'p3',
    name: 'white KM901 Mini Wireless Keyboard',
    category: 'Keyboard',
    price: 1050,
    originalPrice: 1400,
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=600&q=80',
    images: [
      'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1511467687858-23d96c32e4ae?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: false,
    rating: 4.6,
    reviewsCount: 54,
    inStock: true,
    description: 'Ultra-thin, silent typing wireless mini keyboard compatible with PC, Laptop, Android TV, iPad, and Tablet.',
    specs: {
      'Layout': 'Compact 78 Keys',
      'Wireless Tech': '2.4GHz USB Dongle + BT',
      'Range': '10 Meters',
      'Compatibility': 'Windows / Mac / iOS / Android'
    }
  },
  {
    id: 'p4',
    name: 'F11-2 Wireless Microphone',
    category: 'Microphone',
    price: 1250,
    originalPrice: 1800,
    image: wirelessMicImg,
    images: [
      wirelessMicImg,
      'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: false,
    rating: 4.9,
    reviewsCount: 110,
    inStock: true,
    description: 'Dual wireless clip-on lapel mic for video recording, YouTube, Facebook Live, TikTok, and interviews with noise cancellation.',
    specs: {
      'Microphone Type': 'Omnidirectional Lapel',
      'Noise Reduction': 'Smart DSP Chip',
      'Battery Life': '6-8 Hours per charge',
      'Receiver': 'Type-C / Lightning universal'
    }
  },
  {
    id: 'p5',
    name: 'Ultra S9 Smart Watch',
    category: "Watch's",
    price: 3350,
    originalPrice: 4500,
    image: smartWatchImg,
    images: [
      smartWatchImg,
      'https://images.unsplash.com/photo-1508685096489-7aacd43bd3b1?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: true,
    rating: 4.9,
    reviewsCount: 230,
    inStock: true,
    description: 'Flagship Ultra Series smartwatch with 2.2 inch HD AMOLED display, Bluetooth calling, heart rate/spO2 sensors, and multiple sports modes.',
    specs: {
      'Display': '2.2" Always-On AMOLED',
      'Calling': 'HD Bluetooth Speaker & Mic',
      'Waterproof': 'IP68 Daily Waterproof',
      'Sensors': 'Heart Rate, Blood Oxygen, Sleep, Step Counter'
    }
  },
  {
    id: 'p10',
    name: 'Creative Bulb Shaped Humidifier',
    category: 'Humidifier',
    price: 713,
    originalPrice: 1100,
    image: bulbHumidifierImg,
    images: [
      bulbHumidifierImg,
      'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80',
    ],
    isFlashDeal: true,
    isHot: false,
    rating: 4.8,
    reviewsCount: 62,
    inStock: true,
    description: 'Decorative bulb USB desktop mini mist humidifier with 7 color changing ambient LED lights, beach landscape interior decoration.',
    specs: {
      'Capacity': '400ml Water Tank',
      'Power': 'USB Powered (5V)',
      'Lighting': '7-Color Gradient LED',
      'Noise Level': '<36dB Silent Operation'
    }
  }
];

export const CATEGORIES = ['All Products', 'Earbuds', "Watch's", 'Neckband', 'Microphone', 'Keyboard', 'Humidifier', 'Speakers'] as const;
