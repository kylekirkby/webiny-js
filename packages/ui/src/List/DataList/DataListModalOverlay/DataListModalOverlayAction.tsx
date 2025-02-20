import React, { useContext } from "react";
import { IconButton } from "../../../Button";
import { DataListModalOverlayContext } from "./DataListModalOverlayContext";

export interface DataListModalOverlayActionProps {
    icon: React.ReactNode;
    "data-testid"?: string;
}

export const DataListModalOverlayAction: React.FC<DataListModalOverlayActionProps> = ({
    icon,
    ...rest
}) => {
    const { isOpen, setIsOpen } = useContext(DataListModalOverlayContext);

    return (
        <IconButton
            data-testid={rest["data-testid"]}
            icon={icon}
            onClick={() => setIsOpen(!isOpen)}
        />
    );
};
