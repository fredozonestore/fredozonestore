import React from "react";
import { useState } from "react";
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { useForm } from "react-hook-form";
import { Grid } from "@mui/material";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import InputLabel from "@mui/material/InputLabel";
import FormHelperText from "@mui/material/FormHelperText";
function registerFirst({
  onNext,
  setName,
  setLastname,
  setEmail,
  setPhone,
  setStreet,
  setCity,
  setNameState,
  setZipcode,
}) {
  const stateName = [
    "AL",
    "AK",
    "AZ",
    "AR",
    "CA",
    "CO",
    "CT",
    "DE",
    "FL",
    "GA",
    "HI",
    "ID",
    "IL",
    "IN",
    "IA",
    "KS",
    "KY",
    "LA",
    "ME",
    "MD",
    "MA",
    "MI",
    "MN",
    "MS",
    "MO",
    "MT",
    "NE",
    "NV",
    "NH",
    "NJ",
    "NM",
    "NY",
    "NC",
    "ND",
    "OH",
    "OK",
    "OR",
    "PA",
    "RI",
    "SC",
    "SD",
    "TN",
    "TX",
    "UT",
    "VT",
    "VA",
    "WA",
    "WV",
    "WI",
    "WY",
  ];
  const [errorEmail, setErrorEmail] = useState("");
  const [state, setState] = useState(stateName[0]);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: "",
      lastname: "",
      email: "",
      phone: "",
      street: "",
      city: "",
      state: state,
      zipcode: "",
    },
  });

  const onSubmit = async (data) => {
    try {
      const response = await fetch(`http://localhost:3000/check-email-unique`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: data.email }),
      });

      const result = await response.json();

      if (result.unique) {
        onNext();
        setName(data.name);
        setLastname(data.lastname);
        setEmail(data.email);
        setPhone(data.phone);
        setStreet(data.street);
        setCity(data.city);
        setNameState(state);
        setZipcode(data.zipcode);
      } else {
        setErrorEmail("This Email is already in use.");
      }
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <>
      <Box
        component="form"
        sx={{
          "& > :not(style)": { m: 1, width: "500px", maxWidth: "80%" },
        }}
        noValidate
        autoComplete="off"
        key="formRegister"
        className="LoginForm"
        onSubmit={handleSubmit(onSubmit)}
      >
        <div className="names">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                error={!!errors.name}
                id={
                  errors.name
                    ? "outlined-error-helper-text-name"
                    : "outlined-basic-name"
                }
                {...register("name", {
                  required: "This is required.",
                  minLength: {
                    value: 4,
                    message: "Min Lengt is 4",
                  },
                  maxLength: {
                    value: 9,
                    message: "Max Lengt is 9",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Entered value does not match the allowed format.",
                  },
                })}
                sx={{
                  width: "100%",
                }}
                label="First Name"
                variant="outlined"
                key="name"
                onChange={(e) => setName(e.target.value)}
                helperText={errors.name?.message}
                required
              />
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                error={!!errors.lastname}
                id={
                  errors.lastname
                    ? "outlined-error-helper-text-lastname"
                    : "outlined-basic-lastname"
                }
                {...register("lastname", {
                  required: "This is required.",
                  minLength: {
                    value: 4,
                    message: "Min Lengt is 4",
                  },
                  maxLength: {
                    value: 15,
                    message: "Max Lengt is 15",
                  },
                  pattern: {
                    value: /^[A-Za-z\s]+$/,
                    message: "Entered value does not match the allowed format.",
                  },
                })}
                sx={{
                  width: "100%",
                }}
                label="Last Name"
                variant="outlined"
                key="lastname"
                inputProps={{}}
                onChange={(e) => setLastname(e.target.value)}
                helperText={errors.lastname?.message}
                required
              />
            </Grid>
          </Grid>
        </div>
        <TextField
          error={!!errors.email}
          id={
            errors.email
              ? "outlined-error-helper-text-email"
              : "outlined-basic-email"
          }
          {...register("email", {
            required: "This is required.",
            pattern: {
              value: /\S+@\S+\.\S+/,
              message: "Entered value does not match email format",
            },
          })}
          label="Email"
          variant="outlined"
          key="email"
          onChange={(e) => setEmail(e.target.value)}
          helperText={errors.email?.message}
          required
        />
        {errorEmail && <p style={{ color: "red" }}>{errorEmail}</p>}
        <TextField
          error={!!errors.phone}
          id={
            errors.phone
              ? "outlined-error-helper-text-phone"
              : "outlined-basic-phone"
          }
          {...register("phone", {
            required: "This is required.",
            minLength: {
              value: 4,
              message: "Min Lengt is 4",
            },
            maxLength: {
              value: 15,
              message: "Max Lengt is 15",
            },
            pattern: {
              value: /^(0|[1-9]\d*)(\.\d+)?$/,
              message: "Entered value does not match number format",
            },
          })}
          label="Phone Number"
          variant="outlined"
          key="phone"
          onChange={(e) => setPhone(e.target.value)}
          helperText={errors.phone?.message}
          required
        />
        <TextField
          error={!!errors.street}
          id={
            errors.street
              ? "outlined-error-helper-text-street"
              : "outlined-basic-street"
          }
          {...register("street", {
            required: "This is required.",
            minLength: {
              value: 4,
              message: "Min Lengt is 4",
            },
            pattern: {
              value: /^[A-Za-z0-9\s]+$/,
              message: "Entered value does not match the allowed format.",
            },
          })}
          label="Street"
          variant="outlined"
          key="street"
          onChange={(e) => setStreet(e.target.value)}
          helperText={errors.street?.message}
          required
        />
        <TextField
          error={!!errors.city}
          id={
            errors.city
              ? "outlined-error-helper-text-city"
              : "outlined-basic-city"
          }
          {...register("city", {
            required: "This is required.",
            minLength: {
              value: 2,
              message: "Min Lengt is 2",
            },
          })}
          label="City"
          variant="outlined"
          key="city"
          onChange={(e) => setCity(e.target.value)}
          helperText={errors.city?.message}
          required
        />
        <div className="names">
          <Grid container spacing={2}>
            <Grid item xs={12} md={6} lg={6}>
              <FormControl
                fullWidth
                sx={{
                  width: { xs: "95%", md: "100%", lg: "100%" },
                }}
              >
                <InputLabel
                  id={
                    errors.state
                      ? "outlined-error-demo-simple-select-label"
                      : "demo-simple-select"
                  }
                  {...register("state", {
                    required: "This is required.",
                  })}
                >
                  State
                </InputLabel>
                <Select
                  error={!!errors.state}
                  id={
                    errors.state
                      ? "outlined-error-demo-simple-select-label"
                      : "demo-simple-select"
                  }
                  labelId="demo-simple-select-label"
                  value={state}
                  label="state"
                  onChange={(e) => {
                    setState(e.target.value);
                  }}
                >
                  {stateName.map((state, index) => (
                    <MenuItem key={index + 1} value={state}>
                      {state}
                    </MenuItem>
                  ))}
                </Select>
                <FormHelperText sx={{ color: "#d32f2f" }}>
                  {errors.state?.message}
                </FormHelperText>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={6} lg={6}>
              <TextField
                error={!!errors.zipcode}
                id={
                  errors.zipcode
                    ? "outlined-error-helper-text-zipcode"
                    : "outlined-basic-zipcode"
                }
                {...register("zipcode", {
                  required: "This is required.",
                  minLength: {
                    value: 4,
                    message: "Min Lengt is 4",
                  },
                  pattern: {
                    value: /^\d{5}$/,
                    message: "Please enter a valid 5-digit Zip Code",
                  },
                })}
                sx={{
                  width: "100%",
                }}
                label="Zipcode"
                variant="outlined"
                key="zipcode"
                onChange={(e) => setZipcode(e.target.value)}
                helperText={errors.zipcode?.message}
                required
              />
            </Grid>
          </Grid>
        </div>
        <button type="submit" className="Button submit">
          Next
        </button>
      </Box>
    </>
  );
}

export default registerFirst;
