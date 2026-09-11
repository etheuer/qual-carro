import Svg, { Circle, Path } from "react-native-svg";
import { colors } from "../theme.js";

const STROKE = {
  arrowLeft: "M19 12H5M11 5l-7 7 7 7",
  check: "M5 12.5l4.5 4.5L19 7.5",
};

export function Icon({ name, size = 20, color = colors.dust }) {
  if (name === "clear") {
    return (
      <Svg width={size} height={size} viewBox="0 0 24 24">
        <Circle cx="12" cy="12" r="10" fill={color} />
        <Path
          d="M8.5 8.5l7 7M15.5 8.5l-7 7"
          stroke={colors.asphalt}
          strokeWidth={2.2}
          strokeLinecap="round"
        />
      </Svg>
    );
  }
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <Path
        d={STROKE[name]}
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </Svg>
  );
}
