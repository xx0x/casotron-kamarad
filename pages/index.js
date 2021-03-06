import Head from 'next/head';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import useScrollbarSize from 'react-scrollbar-size';
import AppUnsupportedDialog from '../components/AppUnsupportedDialog';
import IntroDialog from '../components/IntroDialog';
import SoundManager from '../components/SoundManager';
import { getIcons } from '../lib/icons';
import { getAvailableSoundSets, getSoundsDefinition } from '../lib/sounds';
import IconsContext from '../utils/IconsContext';
import isAppSupported from '../utils/isAppSupported';

export async function getStaticProps() {
    return {
        props: {
            availableSoundSets: getAvailableSoundSets(),
            soundsDefinition: getSoundsDefinition(),
            icons: getIcons(),
            baseUrl: 'https://kamarad.casotron.cz/'
        }
    };
}

export default function Home(props) {

    const { t } = useTranslation();
    const [showIntroDialog, setShowIntroDialog] = useState(true);
    const [showUnsupportedDialog, setShowUnsupportedDialog] = useState(false);
    const scrollbarSize = useScrollbarSize();

    return (
        <>
            <Head>
                <title>Časotron Kamarád</title>
                <meta name="viewport" content="width=1024" />
                <meta name="description" content={t('seo.description')} />
                <meta property="og:url" content={props.baseUrl} />
                <meta property="og:type" content="website" />
                <meta property="og:title" content={t('seo.title')} />
                <meta property="og:description" content={t('seo.description')} />
                <meta property="og:image" content={`${props.baseUrl}og-image.jpg`} />
            </Head>
            <IconsContext.Provider value={props.icons}>
                <div
                    style={{
                        '--app-scrollbar-width': `${scrollbarSize.width}px`
                    }}
                >
                    <SoundManager
                        availableSoundSets={props.availableSoundSets}
                        soundsDefinition={props.soundsDefinition}
                    />
                    <IntroDialog
                        isOpen={showIntroDialog}
                        onCloseClick={() => {
                            setShowIntroDialog(false);
                            if (!isAppSupported()) {
                                setShowUnsupportedDialog(true);
                            }
                        }}
                    />
                    <AppUnsupportedDialog
                        isOpen={showUnsupportedDialog}
                        onCloseClick={() => {
                            setShowUnsupportedDialog(false);
                        }}
                    />
                </div>
            </IconsContext.Provider>
        </>
    );
}
