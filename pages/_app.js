import '../styles/reset.scss';
import '../styles/fonts.scss';
import '../styles/main.scss';

import { ThemeProvider } from 'styled-components';
import original from 'react95/dist/themes/original';

function MyApp({ Component, pageProps }) {
    return (
        <>
            <ThemeProvider theme={original}>
                <Component {...pageProps} />
            </ThemeProvider>
        </>
    );
}

export default MyApp;
