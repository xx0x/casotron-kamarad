import Button from './ui/Button';
import Dialog from './ui/Dialog';
import Icon from './ui/Icon';
import style from './IntroDialog.module.scss';

export default function IntroDialog(props) {
    return (
        <Dialog
            isOpen={props.isOpen}
            onCloseClick={props.onCloseClick}
            wide
        >
            <div
                className={style.text}
            >
                <h2>
                    Časotron Kamarád
                </h2>
                <ul>
                    <li>Aplikace Časotron Kamarád slouží pro nahrání zvuků do výrobků <a href="http://www.casotron.cz/" target="_blank" rel="noreferrer">Časotron</a> VK49 a EH14.</li>
                    <li>Tento proces je pouze JEDNOSTRANNÝ. Aplikace neví, které zvuky aktuálně v hodinách jsou.</li>
                    <li>Aplikace je v raném stádiu vývoje – použití pouze na vlastní riziko.</li>
                    <li>Nápady na vylepšení a features, hlášení problémů, a vámi vytvořené zvukové banky můžete posílat na <a href="mailto:info@xx0x.cz">info@xx0x.cz</a>.</li>
                </ul>
                <h2>Postup</h2>
                <ul>
                    <li>Vyberte zdrojovou banku zvuků a klikněte na „Načíst“.</li>
                    <li>Přidejte a upravte zvuky podle potřeby.</li>
                    <li>Průběh práce si můžete ukládat – buď do paměti prohlížeče, nebo do souboru.</li>
                    <li>Pomocí USB zapojte hodiny do počítače a otevřte v nich Menu.</li>
                    <li>Klikněte na „<Icon name="066-usb" /> Připojit zařízení“ a v okně vyberte zařízení „Casotron EH14“ nebo „Casotron VK49“. Pokud se zařízení zobrazuje jako „Arduino Zero“, je nejprvne nutné provést aktualizaci firmwaru.</li>
                    <li>Klikněte na „<Icon name="057-upload" />Nahrát do zařízení“. Proces trvá několik minut, v závislosti na množství a délce zvuků.</li>
                </ul>
            </div>
            <div
                className={style.buttons}
            >
                <Button
                    onClick={props.onCloseClick}
                    large
                >
                    <Icon name="083-smile" />
                    Začít
                </Button>
            </div>
        </Dialog>
    );
}