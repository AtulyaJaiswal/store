import React from "react";
import "./Contact.css";
import { Button } from "@mui/material";

const Contact = () => {
  return (
    <div className="contactContainer">
      <a className="mailBtn" href="mailto:atulyajaiswal@yahoo.com">
        <Button>Contact: atulyajaiswal@yahoo.com</Button>
      </a>
    </div>
  );
};

export default Contact;