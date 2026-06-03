import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";

interface SiteCoordinates {
  longitude: number;
  latitude: number;
}

interface SiteContextType {
  selectedSite: SiteCoordinates | undefined;
  setSelectedSite: (longitude: number, latitude: number) => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export const useSiteContext = (): SiteContextType => {
  const context = useContext(SiteContext);
  if (!context)
    throw new Error("useSite must be used within a ContextProvider");
  return context;
};

export const SiteProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [selectedSite, setSelectedSiteState] = useState<
    SiteCoordinates | undefined
  >(undefined);

  const setSelectedSite = useCallback((longitude: number, latitude: number) => {
    setSelectedSiteState({ longitude, latitude });
  }, []);

  const value = useMemo(
    () => ({ selectedSite, setSelectedSite }),
    [selectedSite, setSelectedSite]
  );

  return <SiteContext.Provider value={value}>{children}</SiteContext.Provider>;
};
