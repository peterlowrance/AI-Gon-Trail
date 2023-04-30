import { EuiPanel } from "@elastic/eui";

function AdPanel() {
    return <EuiPanel hasBorder className='info-panel-apper'>
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-5547157842419484"
            crossOrigin="anonymous"></script>
        <ins className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client="ca-pub-5547157842419484"
            data-ad-slot="7660836667"
            data-ad-format="auto"
            data-full-width-responsive="true"></ins>
        <script>
            (adsbygoogle = window.adsbygoogle || []).push({ });
        </script>
    </EuiPanel>;
}

export default AdPanel;