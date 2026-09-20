import React from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import './PageHeader.css';

function PageHeader({ title, description, breadcrumb }) {
    const { t } = useTranslation();

    return (
        <div className="page-header">
            <div className="breadcrumb">
                <Link to="/">{t("sidebar.home")}</Link>
                <span className="separator">→</span>
                <span className="current">{breadcrumb || title}</span>
            </div>
            
            <h1 className="page-title">{title}</h1>
            
            {description && (
                <p className="page-description">{description}</p>
            )}
        </div>
    );
}

export default PageHeader;
