import { redirect } from "../../page";

export const stepCount = 8;

export const nextStep = () => {
    const path = parseInt(location.pathname.replace("/introduce", ""));
    const next = path + 1;
    if (next < stepCount) {
        redirect(`introduce${next}`);
    } else {
        redirect("");
    }
};
export const backStep = () => {
    const path = parseInt(location.pathname.replace("/introduce", ""));
    const next = path - 1;
    if (next >= 0) {
        redirect(`introduce${next}`);
    } else {
        redirect("");
    }
};