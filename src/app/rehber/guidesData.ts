export interface GuidePost {
  id: string;
  titleTr: string;
  titleEn: string;
  descTr: string;
  descEn: string;
  date: string;
  readTimeTr: string;
  readTimeEn: string;
  image: string;
  contentTr: string;
  contentEn: string;
}

export const guidesList: GuidePost[] = [
  {
    id: 'guide-1',
    titleTr: 'Eviniz İçin Doğru Perde Seçimi: Adım Adım Rehber',
    titleEn: 'Choosing the Right Curtains for Your Home: Step-by-Step Guide',
    descTr: 'Odanızın gün ışığı alma oranına, tavan yüksekliğine ve mobilya tarzına göre hangi perdeleri seçmeniz gerektiğini püf noktalarıyla anlatıyoruz.',
    descEn: 'We explain which curtains you should choose according to your room\'s daylight ratio, ceiling height, and furniture style with tips and tricks.',
    date: '2026-06-15',
    readTimeTr: '5 dk okuma',
    readTimeEn: '5 min read',
    image: '/assets/scandi.png',
    contentTr: `
      <h2>1. Pencere Yapısı ve Gün Işığı Analizi</h2>
      <p>Doğru perde seçiminin ilk adımı, odanızın aldığı ışığı analiz etmektir. Kuzeye bakan odalar gün boyu daha az ve soğuk bir ışık alırken, güneye bakan pencereler yoğun güneş ışığı altındadır. Soğuk ve az ışık alan odalarda gün ışığını kesmeyen ince keten tül perdeler tercih edilmelidir. Güneye bakan pencerelerde ise güneş koruması sağlamak amacıyla fon perdeler ve stor perdeler ile katmanlı bir görünüm oluşturulmalıdır.</p>
      
      <h2>2. Tavan Yüksekliği ve Derinlik Hissiyatı</h2>
      <p>Tavanları daha yüksek göstermek için perde rayını veya kornişini tavana olabildiğince yakın monte etmelisiniz. Perde boyunun ise yere hafifçe değmesi (yaklaşık 1-2 cm döküm payı ile) odaya lüks ve dramatik bir İskandinav minimalizmi katacaktır. Kısa perdeler pencereleri böler ve odanın daha küçük görünmesine neden olur.</p>

      <h2>3. Renk Harmonisi ve Mobilya Uyumu</h2>
      <p>Perdelerinizin rengini seçerken odadaki en büyük üç mobilya parçasının renk paletine dikkat edin. Eğer salonunuzda koyu antrasit veya lacivert tonlar hakimse, tül perdelerde kırık beyaz ve bej tonlarını kullanarak kontrast yaratabilirsiniz. Lale Perde'nin imza lacivert ve altın sarısı kumaş tonları, özellikle nötr renkli odalara zarif bir derinlik ve karakter kazandırır.</p>
    `,
    contentEn: `
      <h2>1. Window Structure & Daylight Analysis</h2>
      <p>The first step in choosing the right curtains is analyzing the light your room receives. North-facing rooms receive less and colder light throughout the day, while south-facing windows are under intense sunlight. In cold and poorly lit rooms, thin linen sheer curtains that do not block daylight should be preferred. For south-facing windows, a layered look should be created with drapes and roller blinds to provide sun protection.</p>
      
      <h2>2. Ceiling Height & Illusion of Depth</h2>
      <p>To make ceilings appear higher, mount your curtain track or rod as close to the ceiling as possible. Letting the curtain length touch the floor slightly (with a drape allowance of about 1-2 cm) will add luxury and dramatic Scandinavian minimalism to the room. Short curtains split windows and make the room appear smaller.</p>

      <h2>3. Color Harmony & Furniture Matching</h2>
      <p>When choosing the color of your curtains, pay attention to the color palette of the three largest furniture pieces in the room. If dark anthracite or navy tones dominate your living room, you can create contrast by using off-white and beige tones in sheer curtains. Lale Perde's signature navy and gold fabric tones bring elegant depth and character, especially to neutral-colored rooms.</p>
    `
  },
  {
    id: 'guide-2',
    titleTr: 'Keten Perdelerin Temizliği ve Bakımı Nasıl Yapılır?',
    titleEn: 'How to Clean and Maintain Linen Curtains?',
    descTr: 'Doğal keten kumaşların dokusunu kaybetmeden temizlenmesi, yıkanması ve ütülenmesi sürecinde dikkat etmeniz gereken altın kurallar.',
    descEn: 'The golden rules you need to pay attention to during the cleaning, washing, and ironing process of natural linen fabrics without losing their texture.',
    date: '2026-06-08',
    readTimeTr: '4 dk okuma',
    readTimeEn: '4 min read',
    image: '/assets/fabric.png',
    contentTr: `
      <h2>Keten Kumaşın Doğal Yapısı</h2>
      <p>Keten, doğası gereği nefes alan, anti-alerjik ve organik bir elyaftır. Ancak lif yapısı gereği hassas bir bakım gerektirir. Doğru bakım adımları takip edildiğinde, keten perdeleriniz yıllar boyunca lüks dokusunu korur.</p>

      <h2>Yıkama ve Sıcaklık Kuralları</h2>
      <ul>
        <li>Keten perdelerinizi asla yüksek sıcaklıkta yıkamayın. İdeal yıkama derecesi 30°C'dir.</li>
        <li>Hassas yıkama veya perde programını seçerek düşük devirde (maksimum 400 devir) sıkma yapın. Aşırı sıkma lifleri kırabilir.</li>
        <li>Ağartıcı veya ağır kimyasal deterjanlar kullanmaktan kaçının. Sıvı bebek deterjanları veya hassas kumaş şampuanları idealdir.</li>
      </ul>

      <h2>Kurutma ve Kolay Ütüleme Teknikleri</h2>
      <p>Keten perdelerinizi asla kurutma makinesine atmayın. Nemli bir şekilde kornişe asarak kendi ağırlığıyla kurumaya bırakırsanız, kırışıklıklar doğal olarak açılacaktır. Eğer ütülemek isterseniz, perdeler henüz tam kurumamışken nemli haldeyken yüksek buhar gücüyle tersten ütüleyin.</p>
    `,
    contentEn: `
      <h2>The Natural Structure of Linen</h2>
      <p>Linen is naturally breathable, anti-allergic, and organic. However, due to its fiber structure, it requires delicate care. When the correct care steps are followed, your linen curtains will maintain their luxury texture for years.</p>

      <h2>Washing & Temperature Guidelines</h2>
      <ul>
        <li>Never wash your linen curtains at high temperatures. The ideal washing temperature is 30°C.</li>
        <li>Choose a delicate wash or curtain program with low spin speed (maximum 400 rpm). Excessive spinning can break the fibers.</li>
        <li>Avoid using bleaches or harsh chemical detergents. Liquid baby detergents or delicate fabric shampoos are ideal.</li>
      </ul>

      <h2>Drying & Easy Ironing Techniques</h2>
      <p>Never put your linen curtains in the dryer. If you hang them on the track while still damp and let them dry with their own weight, creases will smooth out naturally. If you want to iron them, do so while they are still damp, ironing from the reverse side with high steam.</p>
    `
  },
  {
    id: 'guide-3',
    titleTr: 'Modern Evlerde Stor ve Jaluzi Kullanım Trendleri',
    titleEn: 'Roller & Venetian Blind Trends in Modern Homes',
    descTr: 'İskandinav minimalizmi ve endüstriyel tasarımlarda ahşap jaluzi ve kumaş storların modern mobilyalarla harika uyum sağlama yöntemleri.',
    descEn: 'Methods of wood venetian blinds and fabric rollers harmonizing beautifully with modern furniture in Scandinavian minimalism and industrial designs.',
    date: '2026-05-28',
    readTimeTr: '6 dk okuma',
    readTimeEn: '6 min read',
    image: '/assets/hero.png',
    contentTr: `
      <h2>Modern Yaşamda Ahşap ve Bambu Jaluziler</h2>
      <p>Bambu ve doğal meşe jaluziler, modern iç mekanlara organik bir sıcaklık katar. Özellikle antrasit ve siyah metal detayların yoğun kullanıldığı endüstriyel tasarımlarda ahşabın doğal dokusu kontrast yaratarak mekana yumuşak bir geçiş sağlar. Lale Perde'nin 50mm bant genişliğindeki sürdürülebilir bambu jaluzileri hem mükemmel bir ışık kontrolü sağlar hem de dışarıdan gelen sıcaklığı izole eder.</p>

      <h2>Stor Perde Modellerinde Fonksiyonel Lüks</h2>
      <p>Minimalist yaşam alanlarında kumaş stor perdeler sade tasarımlarıyla duvarların bir parçası gibi durur. Akıllı ev mekanizmalarıyla birleşen motorlu storlar, modern rezidanslarda gün ışığını tek tuşla kontrol etme konforu sunar.</p>

      <h2>Jaluzi Açı Kontrolüyle Doğal Işık Yönetimi</h2>
      <p>Klasik storların aksine ahşap jaluzilerin en büyük avantajı, bantların açısını ayarlayabilmenizdir. Bu sayede odanın mahremiyetini korurken gün ışığının açısını yansıtarak çalışma masanıza veya televizyon ekranına doğrudan ışık gelmesini engelleyebilirsiniz.</p>
    `,
    contentEn: `
      <h2>Wooden & Bamboo Blinds in Modern Living</h2>
      <p>Bamboo and natural oak venetians add organic warmth to modern interiors. Especially in industrial designs where anthracite and black metal details are heavily used, the natural texture of wood creates contrast, providing a soft transition. Lale Perde's sustainable 50mm bamboo venetians offer both perfect light control and heat insulation.</p>

      <h2>Functional Luxury in Roller Blinds</h2>
      <p>In minimalist living spaces, fabric roller blinds stand like a part of the wall with their plain designs. Motorized roller blinds integrated with smart home mechanisms offer the comfort of controlling daylight with a single button in modern residences.</p>

      <h2>Managing Daylight with Venetian Slat Control</h2>
      <p>Unlike classic roller blinds, the biggest advantage of venetians is the ability to adjust the angle of the slats. This allows you to protect the privacy of the room while directing the angle of daylight to prevent direct glare on desks or television screens.</p>
    `
  }
];
