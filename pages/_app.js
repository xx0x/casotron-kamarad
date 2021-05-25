import i18next from 'i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import { initReactI18next } from 'react-i18next';
import csTranslation from '../i18n/cs.json';
import enTranslation from '../i18n/en.json';
import '../styles/main.scss';

i18next
    .use(LanguageDetector)
    .use(initReactI18next)
    .init({
        resources: {
            en: {
                translation: enTranslation
            },
            cs: {
                translation: csTranslation
            }
        },
        lng: 'cs',
        fallbackLng: 'en',
        interpolation: {
            escapeValue: false
        }
    });

function MyApp({ Component, pageProps }) {
    return (
        <>
            <Component {...pageProps} />
        </>
    );
}

export default MyApp;
