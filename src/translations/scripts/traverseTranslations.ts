import english from "../../../public/locales/en-NZ/common.json";

const keys: string[] = [];

type TranslationRecord = {
    [P in string]: string | TranslationRecord;
};

const _traverseTranslations = (obj: TranslationRecord, path: string[]) => {
    Object.keys(obj).forEach((key) => {
        if (key.startsWith("_")) {
            return;
        }
        const objOrString = obj[key];
        if (typeof objOrString === "string") {
            keys.push([...path, key].join("."));
        } else {
            _traverseTranslations(objOrString, [...path, key]);
        }
    });
};

export const traverseTranslations = () => {
    _traverseTranslations(english, []);
    return keys;
};
