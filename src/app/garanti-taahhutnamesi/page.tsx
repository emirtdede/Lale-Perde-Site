'use client';

import React from 'react';
import { useLanguage } from '../../context/LanguageContext';

export default function WarrantyPage() {
  const { language } = useLanguage();

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '160px 2rem 5rem', lineHeight: 1.8 }}>
      {language === 'tr' ? (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>GARANTİ TAAHHÜTNAMESİ VE SATIŞ SONRASI HİZMET ŞARTLARI</h1>
          
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. GARANTİ KAPSAMI VE SÜRESİ</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.1.</strong> Firmamız Lale Perde tarafından üretilen, satışı ve/veya montajı yapılan tüm perde sistemleri (kumaş, mekanizma, motor donanımları ve montaj işçiliği dâhil olmak üzere) üretim, malzeme ve işçilik hatalarına karşı teslim tarihinden itibaren en az 2 (İki) Yıl süreyle garanti altındadır.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.2.</strong> Bu garanti taahhüdü; Ev Perdeleri, Ofis/Kurumsal Alanlar, Cami/İbadethane, Sahne/Konferans Salonları, Hastane/Klinik, Otel/Konaklama, Dış Mekan/Teras, Endüstriyel (PVC) ve Karavan/Tekne gibi tüm sektörel proje teslimatlarını istisnasız kapsamaktadır.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.3.</strong> Devlet Malzeme Ofisi (DMO) katalogları üzerinden veya kamu ihaleleri kapsamında yapılan alımlarda, DMO mevzuatına, ilgili sözleşme ve teknik şartnamelere tam uygunluk beyan ve taahhüt edilir. Şartnamede belirtilen daha uzun süreli özel garanti hükümleri saklıdır ve önceliklidir.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. ÜCRETSİZ ONARIM VE DEĞİŞİM YÜKÜMLÜLÜĞÜ</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.1.</strong> Ürünün garanti süresi içerisinde, gerek malzeme ve işçilik gerekse montaj hatalarından dolayı arızalanması halinde; işçilik masrafı, değiştirilen parça bedeli ya da başka herhangi bir ad altında hiçbir ücret talep edilmeksizin onarımı yapılacaktır.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.2.</strong> Ürünün onarımının mümkün olmadığı, onarımın 20 iş gününü aşacağı veya ürünün kullanım amacını sürekli olarak engelleyen yapısal bir imalat hatası barındırdığı durumlarda; firmamız ürünü, tüketici/kurum yetkilisinin talebi doğrultusunda ücretsiz olarak yenisi ile değiştirmeyi veya bedel iadesi yapmayı peşinen kabul eder.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.3.</strong> Garanti uygulaması sırasında değiştirilen ürünün veya parçanın garanti süresi, satın alınan ilk ürünün kalan garanti süresi kadardır. Ancak arıza nedeniyle ürünün onarımda/serviste geçirdiği süre, yasal garanti süresine ilave edilir.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. AZAMİ TAMİR SÜRESİ VE SERVİS HİZMETİ</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>3.1.</strong> Ürünlerin azami tamir süresi 20 (yirmi) iş günüdür. Bu süre, ürünün arızasının servis istasyonumuza, servis istasyonunun olmaması durumunda sırasıyla ürünün satıcısı, bayii, acentesi, temsilciliği, ithalatçısı veya imalatçısından birine bildirim tarihinden itibaren başlar.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>3.2.</strong> Sanayi ürünü niteliğindeki motorlu ve mekanik perde arızalarının 10 iş günü içerisinde giderilememesi halinde; firmamız, tamir tamamlanıncaya kadar benzer özelliklere sahip başka bir ürünü / mekanizmayı geçici olarak kurumun/tüketicinin kullanımına tahsis etmeyi taahhüt eder.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>4. GARANTİ KAPSAMI DIŞINDA KALAN HALLER (KULLANICI HATALARI)</h3>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            Ürünlerin firmamızın kontrolü dışındaki dış etkenler veya kullanma talimatlarına aykırı işlemler sebebiyle zarar görmesi durumunda garanti hükümleri geçersiz olacaktır. Aşağıdaki durumlar açıkça garanti kapsamı dışındadır:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', opacity: 0.85 }}>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Hatalı Temizlik ve Bakım:</strong> Ürünle birlikte teslim edilen veya web sitemizde ilan edilen temizlik/yıkama talimatlarına aykırı hareket edilmesi (uygun olmayan kimyasal/ağartıcı kullanımı, yanlış ısıda yıkama/ütüleme sonucu oluşan çekme, yırtılma veya renk solmaları).
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Fiziksel Müdahaleler:</strong> Ürünlerin, firmamızın yetkili servis personeli haricindeki üçüncü şahıslar tarafından sökülmesi, taşınması, kesilmesi, yerinin değiştirilmesi veya tamir edilmeye çalışılması.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Kullanım Amacı Dışında Zorlama:</strong> Mekanik veya motorlu sistemlerin kapasitesini aşacak şekilde fiziksel zorlamaya maruz bırakılması, zincir veya iplerin hatalı açıda asılarak kopartılması.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Çevresel Faktörler ve Şebeke Hataları:</strong> Motorlu perde sistemlerinde binanın elektrik tesisatından kaynaklı voltaj dalgalanmaları, kısa devreler veya topraklama eksikliğinden doğan motor yanmaları.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Mücbir Sebepler:</strong> Deprem, sel, yangın, su basması (özellikle dış mekan/teras perdeleri hariç iç mekan perdelerinin aşırı sıvı temasına maruz kalması) gibi doğal afetler ve kazalar sonucu oluşan hasarlar.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Olağan Yıpranma:</strong> Ürünün doğası gereği, uzun yıllar kullanıma bağlı olarak ortaya çıkabilecek olağan (kumaşın doğal esnemesi vb.) tolerans içi yıpranmalar.
            </li>
          </ul>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>5. KURUMSAL VE BİREYSEL HAK ARAMA YOLLARI</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>5.1.</strong> Bireysel tüketiciler; çıkabilecek uyuşmazlıklarda şikayet ve itirazları için, yasal parasal sınırlar dâhilinde Tüketici Hakem Heyetlerine veya Tüketici Mahkemelerine başvurabilirler.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>5.2.</strong> Devlet Malzeme Ofisi (DMO) ve Kamu Kurumları ile yapılan sözleşmelerde veya ticari nitelikteki kurumsal (B2B) alımlarda ortaya çıkabilecek uyuşmazlıklarda Türk Ticaret Kanunu, Borçlar Kanunu ve ilgili Kamu İhale Mevzuatı hükümleri geçerli olup; yetkili merciiler ilgili mahkemelerdir.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>6. YÜRÜRLÜLÜK BEYANI</h3>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            İşbu garanti taahhütnamesi, ürünün fatura ve irsaliye ile birlikte alıcıya fiziken teslim edildiği tarihte yürürlüğe girer. Sipariş onayı veren ve ürünü teslim alan her kurum/birey, bu şartları okumuş ve kabul etmiş sayılır.
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '2rem', opacity: 0.9 }}>
            <p><strong>Firma Unvanı:</strong> Lale Perde</p>
            <p><strong>Adres:</strong> Gazi Ortaokulu Girişi, Karşıyaka, Gazi Cd., 02400 Kâhta/Adıyaman</p>
            <p><strong>İletişim / Müşteri Hizmetleri:</strong> +90 543 248 05 03</p>
            <p><strong>E-Posta:</strong> laleperdekahta@gmail.com</p>
          </div>
        </>
      ) : (
        <>
          <h1 className="section-title" style={{ fontSize: '2.5rem', marginBottom: '2rem', textAlign: 'left' }}>WARRANTY DECLARATION AND AFTER-SALES SERVICE CONDITIONS</h1>
          
          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>1. WARRANTY COVERAGE AND DURATION</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.1.</strong> All curtain systems (including fabric, mechanism, motor equipment, and installation workmanship) manufactured, sold, and/or installed by Lale Perde are guaranteed against manufacturing, material, and workmanship defects for at least 2 (two) years from the delivery date.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.2.</strong> This warranty commitment covers all sectoral project deliveries without exception, such as Home Curtains, Office/Corporate Areas, Mosque/Houses of Worship, Stage/Conference Halls, Hospital/Clinic, Hotel/Accommodation, Outdoor/Terrace, Industrial (PVC), and Caravan/Boat.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>1.3.</strong> For purchases made through State Supply Office (DMO) catalogs or within the scope of public tenders, full compliance with DMO legislation, relevant contracts, and technical specifications is declared and committed. Longer-term special warranty provisions specified in the specifications are reserved and take precedence.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>2. FREE REPAIR AND REPLACEMENT OBLIGATION</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.1.</strong> In case the product malfunctions during the warranty period due to material, workmanship, or installation defects, it will be repaired without demanding any charge under the name of workmanship cost, replaced part fee, or any other title.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.2.</strong> In cases where the repair of the product is not possible, the repair exceeds 20 business days, or the product contains a structural manufacturing defect that continuously prevents its intended use, our company agrees in advance to replace the product with a new one free of charge or to refund the price upon the request of the consumer/institutional representative.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>2.3.</strong> The warranty period of the product or part replaced during the warranty application is as long as the remaining warranty period of the first purchased product. However, the time the product spends in repair/service due to malfunction is added to the legal warranty period.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>3. MAXIMUM REPAIR DURATION AND SERVICE</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>3.1.</strong> The maximum repair duration of the products is 20 (twenty) business days. This period starts from the date the malfunction of the product is reported to our service station, or in the absence of a service station, to one of the seller, dealer, agent, representative, importer, or manufacturer of the product, respectively.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>3.2.</strong> In case the malfunctions of motorized and mechanical curtains of industrial product quality cannot be resolved within 10 business days, our company commits to temporarily allocate another product/mechanism with similar characteristics to the use of the institution/consumer until the repair is completed.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>4. SITUATIONS OUTSIDE THE WARRANTY COVERAGE (USER ERRORS)</h3>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            In case the products are damaged due to external factors beyond our control or operations contrary to the user manual, the warranty provisions will be invalid. The following situations are explicitly outside the scope of warranty:
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '1.5rem', opacity: 0.85 }}>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Incorrect Cleaning and Maintenance:</strong> Acting contrary to the cleaning/washing instructions delivered with the product or published on our website (use of unsuitable chemicals/bleach, shrinkage, tearing, or color fading resulting from washing/ironing at incorrect temperatures).
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Physical Interventions:</strong> Disassembly, transport, cutting, displacement, or repair attempts of products by third parties other than our company's authorized service personnel.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Forcing Beyond Intended Use:</strong> Exposing mechanical or motorized systems to physical strain exceeding their capacity, breaking chains or cords by hanging them at incorrect angles.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Environmental Factors and Grid Failures:</strong> Motor burnouts caused by voltage fluctuations, short circuits, or lack of grounding in the building's electrical installation in motorized curtain systems.
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Force Majeure:</strong> Damages caused by natural disasters and accidents such as earthquakes, floods, fires, water leakage (especially indoor curtains being exposed to excessive liquid contact, except for outdoor/terrace curtains).
            </li>
            <li style={{ marginBottom: '0.8rem' }}>
              <strong>Normal Wear and Tear:</strong> Normal wear and tear within tolerance limits that may occur due to long years of use due to the nature of the product (natural stretching of the fabric, etc.).
            </li>
          </ul>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>5. CORPORATE AND INDIVIDUAL REMEDIES</h3>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>5.1.</strong> Individual consumers may apply to Consumer Arbitration Committees or Consumer Courts within the legal monetary limits for their complaints and objections in case of disputes.
          </p>
          <p style={{ opacity: 0.85, marginBottom: '1rem' }}>
            <strong>5.2.</strong> In disputes that may arise in contracts made with the State Supply Office (DMO) and Public Institutions or in corporate (B2B) purchases of a commercial nature, the provisions of the Turkish Commercial Code, the Code of Obligations, and the relevant Public Procurement Legislation shall apply, and the authorized bodies are the relevant courts.
          </p>

          <h3 style={{ color: 'var(--color-accent)', marginTop: '2rem', marginBottom: '0.8rem', fontSize: '1.3rem' }}>6. ENTRY INTO FORCE DECLARATION</h3>
          <p style={{ opacity: 0.85, marginBottom: '1.5rem' }}>
            This warranty commitment enters into force on the date the product is physically delivered to the buyer along with the invoice and delivery note. Every institution/individual that confirms the order and receives the product is deemed to have read and accepted these conditions.
          </p>

          <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: '1.5rem', marginTop: '2rem', opacity: 0.9 }}>
            <p><strong>Company Title:</strong> Lale Perde</p>
            <p><strong>Address:</strong> Gazi Ortaokulu Entrance, Karsiyaka, Gazi Cd., 02400 Kahta/Adiyaman</p>
            <p><strong>Contact / Customer Services:</strong> +90 543 248 05 03</p>
            <p><strong>E-Mail:</strong> laleperdekahta@gmail.com</p>
          </div>
        </>
      )}
    </div>
  );
}
