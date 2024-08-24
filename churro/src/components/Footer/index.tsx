import { AppBar, Stack, useTheme, Link, Typography } from "@mui/material";

const Footer = () => {
  const theme = useTheme();

  return (
    <AppBar
      component="footer"
      elevation={0}
      sx={{
        position: "relative",
        bgcolor: "background.default",
        top: "auto",
        bottom: 0,
        [theme.breakpoints.up("sm")]: {
          position: "fixed",
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent={{ xs: "space-evenly", sm: "space-between" }}
        sx={{ px: 3, py: 2 }}
      >
        {/* Left */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={2}
          sx={{ height: "100%" }}
        >
          <Link href="/about" color="inherit" underline="hover">
            <Typography variant="body2">About Us</Typography>
          </Link>
          <Link href="/contact" color="inherit" underline="hover">
            <Typography variant="body2">Contact</Typography>
          </Link>
          <Link href="/privacy" color="inherit" underline="hover">
            <Typography variant="body2">Privacy Policy</Typography>
          </Link>
        </Stack>

        {/* Right */}
        <Stack
          direction={{ xs: "column", sm: "row" }}
          alignItems="center"
          spacing={2}
          sx={{ height: "100%" }}
        >
          <Link href="/terms" color="inherit" underline="hover">
            <Typography variant="body2">Terms of Service</Typography>
          </Link>
          <Link href="/sitemap.xml" color="inherit" underline="hover">
            <Typography variant="body2">Sitemap</Typography>
          </Link>
          <Typography variant="body2">© {new Date().getFullYear()} Cheddar Inc.</Typography>
        </Stack>
      </Stack>
    </AppBar>
  );
};

export default Footer;