import HomeTitle from "@/src/components/HomeTitle";
import React from "react";
import { Stack, Container, Typography } from "@mui/material";

type StatProps = {
  title: string;
  subtitle: string;
};

const Stat: React.FC<StatProps> = ({ title, subtitle }) => (
  <Stack alignItems="center">
    <Typography variant="h3">{title}</Typography>
    <Typography color="primary.light" variant="body2">
      {subtitle}
    </Typography>
  </Stack>
);

const Section3 = () => {
  return (
    <Container maxWidth="md">
      <Stack alignItems="center" sx={{ textAlign: "center" }}>
        <HomeTitle sx={{ mb: 1.5 }}>THE PROTOCOL</HomeTitle>

        <Typography variant="h2" sx={{ fontWeight: "bold", mb: 2 }}>
          Global Chat to Buy meme coins.
        </Typography>

        <Typography sx={{ letterSpacing: "1.5px" }} color="text.secondary">

        Cheddar is our groundbreaking global chat platform that enables users to purchase meme coins using Solana actions and blinks. 
        </Typography>
      </Stack>

      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-evenly"
        spacing={2}
        sx={{ mt: 3 }}
      >
        <Stat title=">$8Bn" subtitle="NOTIONAL TRADED" />
        <Stat title=">$11Bn" subtitle="NOTIONAL LIQUIDITY PROVIDED" />
      </Stack>
    </Container>
  );
};

export default Section3;
