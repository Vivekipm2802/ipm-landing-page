import React, { useState } from "react";
import CustomSelect from "./CustomSelect";
import styles from "../pages/Home.module.css";

const EnquiryForm = ({ formData, setFormData, validateEmail, validatePhone, years, onSubmit }) => {
  const [touched, setTouched] = useState({ email: false, phone: false });

  return (
    <div>
      <div className={styles.formcont}>
        <h1 className={styles.team_heading}>
          Fill out the form to Schedule FREE 1-1 Consultation with an Expert
        </h1>
        <input
          name="name"
          className={styles.input}
          placeholder="Enter your Full Name"
          type="text"
          value={formData?.fullname || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, fullname: e.target.value }))}
        />
        <input
          name="email"
          className={`${styles.input} ${
            touched.email && !validateEmail(formData?.email || "") ? styles.fielderror : ""
          }`}
          placeholder="Enter your Email Address"
          type="text"
          value={formData?.email || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, email: true }))}
        />
        <input
          name="phone"
          className={`${styles.input} ${
            touched.phone && !validatePhone(formData?.phone || "") ? styles.fielderror : ""
          }`}
          placeholder="Enter your Phone Number"
          type="text"
          value={formData?.phone || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
          onBlur={() => setTouched((prev) => ({ ...prev, phone: true }))}
        />
        <input
          name="city"
          className={styles.input}
          placeholder="Enter your City"
          type="text"
          value={formData?.city || ""}
          onChange={(e) => setFormData((prev) => ({ ...prev, city: e.target.value }))}
        />
        <CustomSelect
          z={9}
          full="true"
          defaultText="When are you planning to take IPM?"
          noPadding={true}
          objects={years}
          setSelect={(value) => setFormData((prev) => ({ ...prev, year: value }))}
        />
        {formData?.city &&
        formData?.fullname &&
        formData?.phone &&
        formData?.email &&
        formData?.year ? null : (
          <p className={styles.error}>Please fill all the fields</p>
        )}
        <div onClick={onSubmit} className={styles.submit}>
          SUBMIT
        </div>
      </div>
    </div>
  );
};

export default EnquiryForm;