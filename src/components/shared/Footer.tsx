import { IconBrandFacebookFilled, IconBrandInstagram, IconBrandX } from "@tabler/icons-react";
import { Link } from "react-router-dom";


const Footer = () => (
  <footer className="hidden md:block my-nav shadow-md py-8 mt-5">
    <div className="max-w-7xl mx-auto px-4 grid grid-cols-4 gap-8 text-sm">
      <div>
        <h3 className="font-semibold mb-2">Customer Service</h3>
        <ul>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Help Center</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Contact Us</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Report Abuse</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">About Us</h3>
        <ul>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Company Info</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Careers</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Privacy Policy</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Payment & Shipping</h3>
        <ul>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Payment Methods</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Shipping Guide</Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500">Return Policy</Link></li>
        </ul>
      </div>
      <div>
        <h3 className="font-semibold mb-2">Follow Us</h3>
        <ul className="flex space-x-4">
          <li><Link to="/contact" className="hover:underline hover:text-orange-500"><IconBrandFacebookFilled /></Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500"><IconBrandX stroke={2} /></Link></li>
          <li><Link to="/contact" className="hover:underline hover:text-orange-500"><IconBrandInstagram stroke={2} /></Link></li>
        </ul>
      </div>
    </div>
    <div className="mt-8 text-center text-xs text-orange-500">
      &copy; {new Date().getFullYear()} Ushop. All rights reserved.
    </div>
  </footer>
);

export default Footer;