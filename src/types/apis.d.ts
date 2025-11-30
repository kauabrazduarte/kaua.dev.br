export interface OpenMeteoResponse {
  latitude: number;
  longitude: number;
  generationtime_ms: number;
  utc_offset_seconds: number;
  timezone: string;
  timezone_abbreviation: string;
  elevation: number;

  current_units: {
    time: string;
    interval: string;
    temperature_2m: string;
    weather_code: string;
  };

  current: {
    time: string;
    interval: number;
    temperature_2m: number;
    weather_code: number;
  };

  hourly_units: {
    time: string;
    temperature_2m: string;
    weather_code: string;
  };

  hourly: {
    time: string[];
    temperature_2m: number[];
    weather_code: number[];
  };
}
