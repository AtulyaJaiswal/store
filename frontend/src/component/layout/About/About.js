import React from "react";
import "./About.css";
import { Button, Typography, Avatar } from "@mui/material";
import YouTubeIcon from '@mui/icons-material/YouTube';
import InstagramIcon from '@mui/icons-material/Instagram';
const About = () => {
  const visitInstagram = () => {
    window.location = "https://instagram.com/atulyajaiswal";
  };
  return (
    <div className="aboutSection">
      <div></div>
      <div className="aboutSectionGradient"></div>
      <div className="aboutSectionContainer">
        <Typography component="h1">About Us</Typography>

        <div>
          <div>
            <Avatar
              style={{ width: "10vmax", height: "10vmax", margin: "2vmax 0" }}
              src="https://i0.wp.com/therumzzline.com/wp-content/uploads/2021/03/Ecommerce-site-logo-Online-Shopping-N-Shop-Logo-copy.jpg?resize=1400%2C700&ssl=1"
              alt="Founder"
            />
            <Typography>Atulya Jaiswal</Typography>
            <Button onClick={visitInstagram} color="primary">
              Visit Instagram   <InstagramIcon/>
            </Button>
          </div>
          <div className="aboutSectionContainer2">
            <Typography component="h2">Our Brands</Typography>
            <span>
              This is a sample website made by a 3rd year student. This is only to showcase MERN stack build.
              Learned a lot on way of building.
            </span>


          </div>
        </div>
      </div>
    </div>
  );
};

export default About;