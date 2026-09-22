import React from "react";
import { useTranslation } from "react-i18next";
import "./LanguageSelector.css";

function LanguageSelector() {
    const { i18n, t } = useTranslation();

    const changeLanguage = (event) => {
        i18n.changeLanguage(event.target.value);
    };

    return (
        <div className="language-selector">
            <span className="language-icon">🌐</span>
            <select
                value={i18n.language || "en"}
                onChange={changeLanguage}
                aria-label={t("header.languageSelect")}
                className="language-dropdown"
            >
                <option value="en">English</option>
                <option value="te">తెలుగు</option>
                <option value="hi">हिंदी</option>
                <option value="ta">தமிழ்</option>
                <option value="kn">ಕನ್ನಡ</option>
                <option value="ml">മലയാളം</option>
                <option value="bn">বাংলা</option>
            </select>
        </div>
    );
}

export default LanguageSelector;
