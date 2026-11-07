// data.js - Dữ liệu văn hóa Phật giáo, Màu áo, Cấp tu, Kinh tụng, Quẻ xăm và Nhiệm vụ

window.CHUA_DATA = {
  robeColors: [
    { id: 1, name: "Vàng Nghệ", robe: "#d9822b", sash: "#9e5414" },
    { id: 2, name: "Cam Tiểu Tăng", robe: "#e86f2c", sash: "#a84412" },
    { id: 3, name: "Nâu Sồng", robe: "#785238", sash: "#4a301e" },
    { id: 4, name: "Lam Huế", robe: "#64768c", sash: "#3f4d5e" },
    { id: 5, name: "Xanh Thanh Tịnh", robe: "#3e6b9c", sash: "#244469" },
    { id: 6, name: "Đỏ Phúc Lộc", robe: "#a63a3a", sash: "#6e1f1f" },
    { id: 7, name: "Xanh Ngọc Bích", robe: "#468259", sash: "#285236" },
    { id: 8, name: "Vàng Hoàng Kim", robe: "#b87a28", sash: "#7a4e12" },
    { id: 9, name: "Tím Liên Hoa", robe: "#744982", sash: "#4a2a54" },
    { id: 10, name: "Vàng Ánh Nhật", robe: "#d9a74a", sash: "#9c7021" },
    { id: 11, name: "Lam Sương Khói", robe: "#8ca3b5", sash: "#5b7082" },
    { id: 12, name: "Nâu Đất Tổ", robe: "#5c3824", sash: "#381f11" }
  ],

  characterTypes: [
    { id: "monk", label: "Tiểu tăng", hair: "shaved", desc: "Chú tiểu đầu tròn dễ thương, áo tràng nâu vàng" },
    { id: "male", label: "Phật tử nam", hair: "short", desc: "Cư sĩ nam trang nghiêm khoác áo tràng lễ Phật" },
    { id: "female", label: "Phật tử nữ", hair: "bun", desc: "Cư sĩ nữ dịu dàng búi tóc thanh lịch" }
  ],

  dharmaNames: [
    "Tịnh Nghiêm", "Thiện Tâm", "An Lạc", "Minh Đức", "Diệu Hoa",
    "Huệ Đăng", "Từ Quang", "Chánh Niệm", "Phúc Tuệ", "Thanh Lương",
    "Tịnh Độ", "Giác Ngộ", "Bảo Liên", "Hiền Hòa", "Tâm An"
  ],

  levels: [
    { level: 1, name: "Sơ Tâm", minMerit: 0, rewardSen: 0, unlock: "Mở khóa hành lễ cơ bản" },
    { level: 2, name: "Tinh Tấn", minMerit: 30, rewardSen: 50, unlock: "Mở khóa Linh thú: Mèo Chùa" },
    { level: 3, name: "Định Tâm", minMerit: 100, rewardSen: 120, unlock: "Mở khóa Linh thú: Chim Sẻ & Nón Lá" },
    { level: 4, name: "Từ Bi", minMerit: 250, rewardSen: 250, unlock: "Mở khóa Linh thú: Thỏ Ngọc" },
    { level: 5, name: "Trí Huệ", minMerit: 500, rewardSen: 500, unlock: "Mở khóa Linh thú: Rùa Vàng & Hào Quang" },
    { level: 6, name: "An Lạc", minMerit: 1000, rewardSen: 1000, unlock: "Mở khóa Linh thú: Hạc Tiên" }
  ],

  companions: [
    { id: "none", name: "Không dẫn theo", icon: "🚫", minLevel: 1, color: "#cbbda4", desc: "Đi lễ chùa một mình thanh tịnh" },
    { id: "cat", name: "Mèo Chùa", icon: "🐱", minLevel: 1, color: "#f5a642", desc: "Chú mèo vàng ngoan ngoãn hay nằm sưởi nắng bên hiên chùa" },
    { id: "sparrow", name: "Chim Sẻ", icon: "🐦", minLevel: 2, color: "#9ec4e8", desc: "Chim sẻ nhỏ ríu rít nhảy nhót theo bước chân" },
    { id: "rabbit", name: "Thỏ Ngọc", icon: "🐰", minLevel: 3, color: "#fff5eb", desc: "Thỏ trắng hiền lành mang lại sự bình yên" },
    { id: "turtle", name: "Rùa Vàng", icon: "🐢", minLevel: 4, color: "#d4a438", desc: "Linh quy cổ kính từ hồ sen Chùa Vô Lượng" },
    { id: "crane", name: "Hạc Tiên", icon: "🦢", minLevel: 5, color: "#f7e8c8", desc: "Hạc trắng thanh tao biểu tượng của trí tuệ và an lạc" }
  ],

  offerings: [
    { id: "incense", name: "Nén Hương Trầm", icon: "🪔", merit: 5, costSen: 0, desc: "Ba nén tâm hương dâng lên Tam Bảo, khói trầm quyện lời cầu bình an." },
    { id: "lotus", name: "Hoa Sen Hồng", icon: "🪷", merit: 8, costSen: 10, desc: "Đóa sen thơm ngát tinh khiết dâng trước đài sen Phật." },
    { id: "fruits", name: "Mâm Ngũ Quả", icon: "🍑", merit: 12, costSen: 20, desc: "Trái ngọt bốn mùa biểu trưng cho lòng thành kính và quả lành." },
    { id: "candle", name: "Đôi Nến Bơ", icon: "🕯️", merit: 10, costSen: 15, desc: "Ánh sáng trí tuệ xua tan vô minh, soi sáng tâm hồn." },
    { id: "tea", name: "Trà Sen Tinh Khiết", icon: "🍵", merit: 6, costSen: 5, desc: "Chén trà thanh khiết dâng cúng chư Phật mười phương." },
    { id: "lamp", name: "Đèn Lưu Ly", icon: "🏮", merit: 15, costSen: 30, desc: "Ngọn đèn lưu ly bất diệt cầu nguyện quốc thái dân an." }
  ],

  sutras: [
    {
      id: "adida",
      title: "Niệm Hồng Danh A Di Đà Phật",
      subtitle: "Pháp môn Tịnh Độ · Dễ nhiếp tâm",
      lines: [
        "Nam mô Tây Phương Cực Lạc Thế Giới Đại Từ Đại Bi A Di Đà Phật.",
        "Nam mô A Di Đà Phật.",
        "Nam mô A Di Đà Phật.",
        "Nam mô A Di Đà Phật.",
        "Nam mô Đại Bi Quan Thế Âm Bồ Tát.",
        "Nam mô Đại Thế Chí Bồ Tát.",
        "Nam mô Địa Tạng Vương Bồ Tát.",
        "Nam mô Thanh Tịnh Đại Hải Chúng Bồ Tát."
      ]
    },
    {
      id: "batnha",
      title: "Bát Nhã Ba La Mật Đa Tâm Kinh",
      subtitle: "Khai mở trí tuệ Bát Nhã · Quán chiếu tánh Không",
      lines: [
        "Quán Tự Tại Bồ Tát hành thâm Bát Nhã Ba La Mật Đa thời, chiếu kiến ngũ uẩn giai không, độ nhất thiết khổ ách.",
        "Xá Lợi Tử! Sắc bất dị không, không bất dị sắc; sắc tức thị không, không tức thị sắc.",
        "Thọ, tưởng, hành, thức, diệc phục như thị.",
        "Xá Lợi Tử! Thị chư pháp không tướng, bất sanh bất diệt, bất cấu bất tịnh, bất tăng bất giảm.",
        "Thị cố không trung vô sắc, vô thọ, tưởng, hành, thức; vô nhãn, nhĩ, tỷ, thiệt, thân, ý.",
        "Vô sắc, thanh, hương, vị, xúc, pháp; vô nhãn giới, nãi chí vô ý thức giới.",
        "Vô vô minh, diệc vô vô minh tận, nãi chí vô lão tử, diệc vô lão tử tận.",
        "Vô khổ, tập, diệt, đạo; vô trí diệc vô đắc, dĩ vô sở đắc cố.",
        "Yết đế, yết đế, ba la yết đế, ba la tăng yết đế, Bồ đề tát bà ha."
      ]
    },
    {
      id: "tanphat",
      title: "Kệ Tán Phật & Đảnh Lễ",
      subtitle: "Tán dương công đức Phật Bảo",
      lines: [
        "Phật thân thanh tịnh tựa lưu ly,",
        "Phật diện như trăng rằm sáng tỏ,",
        "Phật tại thế gian thường cứu khổ,",
        "Phật tâm vô lượng độ quần mê.",
        "Áo giải thoát trang nghiêm thanh tịnh,",
        "Ruộng phước điền gieo hạt từ bi,",
        "Con nay chí thành xin đảnh lễ,",
        "Nguyện cầu thế giới trọn bình an."
      ]
    },
    {
      id: "chudaibi",
      title: "Tâm Chú Đại Bi (Trích đoạn)",
      subtitle: "Đại Từ Đại Bi Cứu Khổ Cứu Nạn",
      lines: [
        "Nam mô Hắc ra đát na đa ra dạ da.",
        "Nam mô A rị da, bà lô yết đế thước bát ra da.",
        "Bồ đề tát đỏa bà da, ma ha tát đỏa bà da.",
        "Ma ha ca lô ni ca da. Án, tát bàn ra phạt duệ.",
        "Số đát na đát tỏa. Nam mô tất kiết lật đỏa y mông a rị da.",
        "Bà lô kiết đế thất Phật ra lăng đà bà.",
        "Nam mô na ra cẩn trì hê rị ma ha bàn đa sa mế.",
        "Án, tất điện đô, mạn đa ra, bạt đà dạ, ta bà ha."
      ]
    },
    {
      id: "hoihuong",
      title: "Kệ Hồi Hướng Công Đức",
      subtitle: "Đem công đức lành hồi hướng cho muôn loài",
      lines: [
        "Nguyện đem công đức này,",
        "Hướng về khắp tất cả,",
        "Đệ tử và chúng sanh,",
        "Đều trọn thành Phật đạo.",
        "Nguyện tiêu tam chướng trừ phiền não,",
        "Nguyện đắc trí tuệ chơn minh liễu,",
        "Phổ nguyện tội chướng tất tiêu trừ,",
        "Thế thế thường hành Bồ Tát đạo."
      ]
    }
  ],

  fortunes: [
    {
      num: "01",
      rank: "Thượng Thượng",
      rankClass: 0,
      title: "Hồng Nhật Đương Không",
      poem: "Mặt trời rực rỡ giữa tầng không,\nMuôn dặm mây tan rạng ánh hồng.\nTâm thiện gieo mầm nay trổ quả,\nGia môn hưng thịnh vạn điều thông.",
      overall: "Quẻ đại cát. Mọi việc mong cầu đều hanh thông như mặt trời giữa trưa.",
      work: "Công việc thuận lợi, gặp quý nhân nâng đỡ, mở ra cơ hội mới.",
      love: "Gia đạo ấm êm, nhân duyên hòa hợp, tiếng cười ngập tràn.",
      health: "Thân tâm an khang, tinh thần minh mẫn."
    },
    {
      num: "08",
      rank: "Thượng Cát",
      rankClass: 1,
      title: "Xuân Mộc Phát Hoa",
      poem: "Cây khô gặp nắng lại đơm bông,\nMưa móc thấm nhuần khắp núi sông.\nChậm rãi bền lòng thêm phước đức,\nCuối đường gặt hái quả thành công.",
      overall: "Sau cơn thử thách là lúc vận may nở rộ, kiên trì ắt đạt thành tựu.",
      work: "Dự định đang ấp ủ sẽ dần có kết quả tốt đẹp.",
      love: "Chân thành thấu hiểu giúp tình cảm ngày càng gắn bó.",
      health: "Nghỉ ngơi điều độ, năng đi bộ và giữ tâm thanh thản."
    },
    {
      num: "15",
      rank: "Thượng Thượng",
      rankClass: 0,
      title: "Minh Châu Xuất Hải",
      poem: "Ngọc sáng vươn lên khỏi biển sâu,\nHào quang chiếu rọi khắp đôi bờ.\nLòng nhân tích đức trời ban phước,\nPhú quý bình an trọn ước mơ.",
      overall: "Tài năng và lòng tốt của bạn được mọi người ghi nhận, phúc lộc dồi dào.",
      work: "Tài lộc hanh thông, thích hợp khởi sự việc lành.",
      love: "Tình duyên viên mãn, người độc thân dễ gặp tri kỷ.",
      health: "Khí huyết lưu thông, sức khỏe dồi dào."
    },
    {
      num: "22",
      rank: "Trung Bình",
      rankClass: 2,
      title: "Tĩnh Thủy Quan Ngư",
      poem: "Nước lặng trăng thanh hiện đáy hồ,\nVội vàng chi nữa bước bôn ba.\nGiữ tâm an tĩnh chờ thời tới,\nGió thuận buồm xuôi vượt hải hà.",
      overall: "Lúc này nên tĩnh tâm quan sát, trau dồi bản thân hơn là nóng vội.",
      work: "Cẩn trọng trong từng bước đi, làm chắc từng việc nhỏ.",
      love: "Lắng nghe và nhường nhịn nhau một chút sẽ giữ được hòa khí.",
      health: "Chú ý giấc ngủ, dành thời gian thiền định thư giãn."
    },
    {
      num: "36",
      rank: "Thượng Cát",
      rankClass: 1,
      title: "Bạch Hạc Quy Lâm",
      poem: "Hạc trắng tung bay giữa cõi ngàn,\nTìm về chốn cũ hưởng bình an.\nThiện duyên hội tụ người hiền đức,\nMột nén tâm hương vạn sự nhàn.",
      overall: "Bình an, thanh thản. Những lo âu cũ dần tan biến.",
      work: "Có tin vui từ phương xa hoặc từ người đồng hành.",
      love: "Gia đình sum vầy, tình cảm bền chặt.",
      health: "Bình an vô sự, tâm an thì thân khỏe."
    },
    {
      num: "54",
      rank: "Thượng Thượng",
      rankClass: 0,
      title: "Kim Liên Khai Nở",
      poem: "Sen vàng nở rộ giữa hồ trong,\nHương ngát bay xa thỏa ước mong.\nMỗi bước tu tâm thêm phước báu,\nBình an hạnh phúc trọn muôn lòng.",
      overall: "Phước lành hội tụ, tâm nguyện chân chính đều được viên thành.",
      work: "Mọi kế hoạch tiến triển suôn sẻ ngoài mong đợi.",
      love: "Tình thương lan tỏa, gia đạo thuận hòa.",
      health: "Tràn đầy năng lượng tích cực."
    }
  ],

  quests: [
    { id: "enter_gate", title: "Bước qua Cổng Tam Quan vào chùa", target: 1, rewardMerit: 5, rewardSen: 10 },
    { id: "bow", title: "Lạy Phật thành tâm (3 lần)", target: 3, rewardMerit: 10, rewardSen: 15 },
    { id: "incense", title: "Thắp hương dâng lễ tại Lư Hương", target: 1, rewardMerit: 10, rewardSen: 15 },
    { id: "beads", title: "Lần tràng hạt niệm Phật (18 hạt)", target: 18, rewardMerit: 15, rewardSen: 20 },
    { id: "chant", title: "Gõ mõ tụng kinh (10 tiếng mõ)", target: 10, rewardMerit: 10, rewardSen: 15 },
    { id: "bell", title: "Thỉnh Đại Hồng Chuông", target: 1, rewardMerit: 8, rewardSen: 10 },
    { id: "lantern", title: "Thả đèn hoa đăng tại Hồ Sen", target: 1, rewardMerit: 10, rewardSen: 20 }
  ],

  initialWishes: [
    { author: "Tịnh Tâm 18", time: "2 phút trước", text: "Cầu mong cha mẹ luôn mạnh khỏe, bình an vô sự.", likes: 12 },
    { author: "Diệu Nghiêm", time: "5 phút trước", text: "Nguyện cho tâm luôn sáng, lòng luôn an trước mọi sóng gió.", likes: 8 },
    { author: "Minh Đức 68", time: "9 phút trước", text: "Mong công việc hanh thông, gia đình hòa thuận ấm êm.", likes: 15 },
    { author: "An Lạc Hoa", time: "14 phút trước", text: "Nam Mô A Di Đà Phật, cầu cho muôn loài đều an vui.", likes: 21 }
  ],

  initialChat: [
    { sender: "Hệ thống", sys: true, text: "Chào mừng bạn về Chùa Vô Lượng. Bước qua Cổng Tam Quan để bắt đầu hành lễ!" },
    { sender: "Sư Thầy", abbot: true, text: "Quét sân chùa là quét bụi trong lòng mình đó con. Tâm bình thì thế giới bình." },
    { sender: "Diệu Hoa 24", text: "Nam mô A Di Đà Phật 🙏 Chúc mọi người ngày mới an lành!" },
    { sender: "Thiện Tâm 89", text: "Tiếng chuông chùa nghe thanh tịnh quá." }
  ]
};

