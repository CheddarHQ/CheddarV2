import CircleIcon from "@mui/icons-material/Circle";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import {
  AppBar,
  Button,
  ButtonProps,
  Stack,
  Typography,
  keyframes,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import Image from "next/image";
import Logo from "public/cheddar.png";
import MainButton from "../buttons/MainButton";
import MenuIcon from "@mui/icons-material/Menu";

export const MenuButton: React.FC<ButtonProps> = ({ children, sx = {} }) => (
  <Button
    sx={(theme) => ({
      letterSpacing: "2px",
      fontSize: 14,
      color: "text.secondary",
      cursor: "pointer",
      ":hover": {
        bgcolor: "transparent",
        color: "text.primary",
        filter: theme.custom.customShadow1,
      },
      ...sx,
    })}
  >
    {children}
  </Button>
);

const resourceKeyframe = keyframes`
  0% {
    opacity: 1;
  }
  60% {
    opacity: 0.4;
  }
  100% {
    opacity: 1;
  }
`;

const Navbar = () => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  return (
    <AppBar
      elevation={0}
      position="sticky"
      sx={{
        px: 3,
        pt: 2,
        pb: 2,
        bgcolor: "transparent",
        backdropFilter: "blur(8px)",
        [theme.breakpoints.up("md")]: {
          pt: 2.5,
        },
      }}
    >
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ height: "100%" }}
      >
        {/* Logo */}
        <Stack
          direction="row"
          alignItems="start"
          justifyContent="flex-start"
          // sx={{ pl: 1, flex: 1 }}
          // spacing={5}
        >
          <Image
            src={Logo}
            alt="Logo"
            style={{ height: "40px", width:"40px", objectFit: "contain", paddingBottom: "14px" }}
            />

          <Stack
            direction="row"
            alignItems="center"
            sx={{
              color: "primary.light",
              animation: `${resourceKeyframe} 3s infinite ease`,
            }}
          >
            <Typography variant="body2" sx={{ letterSpacing: "3px" }}>
              CHEDDAR 🧀
            </Typography>
          </Stack>
        </Stack>

        {/* Links */}
        {!isMobile && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={3}
            flexWrap="wrap"
          >
            <MainButton size="small" sx={{ height: 32 }}>
              BETA
            </MainButton>
          </Stack>
        )}

        {isMobile && (
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="flex-end"
            spacing={2}
            flexWrap="wrap"
          >
            <Typography variant="body2">MENU</Typography>
            <MenuIcon />
          </Stack>
        )}
      </Stack>
    </AppBar>
  );
};

export default Navbar;
