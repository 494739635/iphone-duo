/* ============================================================
   iPhone Duo — Interactive Teardown Lab
   Three.js 0.170 · procedural geometry only · no model files
   ============================================================ */

import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';

// ------------------------------------------------------------
// Constants & part data
// ------------------------------------------------------------

const W = 16.46;            // open width, 164.6 mm (1 unit = 10 mm)
const H = 11.78;            // height, 117.8 mm
const T = 0.52;             // open thickness, 5.2 mm
const HALF_W = 8.15;
const HALF_X = 4.155;
const GAP = 0.16;
const CORNER = 0.63;
const FASTENERS_TOTAL = 47;

const CATEGORIES = {
  exterior:    { label: '外观结构', short: 'EXTERIOR',   color: '#7af7df' },
  compute:     { label: '核心计算', short: 'COMPUTE',    color: '#77a8ff' },
  power:       { label: '能源散热', short: 'POWER',      color: '#ffc27a' },
  camera:      { label: '影像系统', short: 'OPTICS',     color: '#ff86a0' },
  mechanical:  { label: '机械结构', short: 'MECHANICAL', color: '#b8a7ff' }
};

const PART_DATA = [
  {
    id: 'innerDisplay', no: '01', name: '折叠内屏', en: 'Inner Display Assembly',
    category: 'exterior', spec: '7.6″ · 120 Hz · 3000 nits', partNo: '661-DU01',
    anchor: [-5.25, 3.75, 0.28], explode: [0.25, 0.55, 4.55], delay: 0.18,
    priority: 10, focusDistance: 21, view: 'front',
    specs: [['面板', '7.6″ 柔性 OLED'], ['分辨率', '1878 × 2670 / 430 ppi'], ['亮度', '3000 尼特峰值'], ['叠层', '10 层复合结构']],
    desc: '覆盖整个展开面的 Super Retina XDR 柔性 OLED，由纳米纹理盖板、触控感应层、发光层、薄膜封装与超薄金属背板等 10 层结构复合而成。中缝区域采用中性层堆叠，让弯折应力尽量不落在发光材料上。',
    repair: '内屏总成被大量结构性粘合剂固定，完整拆卸约需 1 小时。分离前必须先断开两块电池，任何从边缘强行掀起的动作都可能撕裂中缝排线。'
  },
  {
    id: 'coverLayer', no: '02', name: '纳米纹理盖板', en: 'Nano-texture Cover Glass',
    category: 'exterior', spec: 'Ceramic Shield 2 · 纳米蚀刻', partNo: '661-DU02',
    anchor: [3.15, 3.85, 0.31], explode: [0.5, 1.45, 5.75], delay: 0.23,
    priority: 4, focusDistance: 21, view: 'front',
    specs: [['材质', 'Ceramic Shield 2'], ['表面', '纳米级哑光蚀刻'], ['厚度', '约 0.55 mm'], ['透光率', '＞ 91%']],
    desc: '覆盖在柔性内屏之上的超薄强化玻璃。纳米纹理通过微观蚀刻打散反射，让 7.6 英寸大屏在顶光下依然保持低眩光；边缘以 2.5D 弧度收进钛金属中框。',
    repair: '盖板与内屏在工厂内以光学胶整面贴合，无法单独无损分离。售后以「内屏总成」整体更换，避免复贴造成气泡与折痕。'
  },
  {
    id: 'displayPlate', no: '03', name: '显示支撑层', en: 'Display Support Stack',
    category: 'mechanical', spec: '10 layers · titanium carrier', partNo: '661-DU03',
    anchor: [-3.8, -3.65, 0.2], explode: [0.1, -0.5, 2.9], delay: 0.13,
    priority: 3, focusDistance: 20, view: 'front',
    specs: [['结构', '10 层支撑堆叠'], ['背板', '超薄钛合金'], ['功能', '抗折痕 / 散热'], ['厚度', '约 1.2 mm']],
    desc: '内屏背后的多材料支撑系统，包含缓冲泡棉、石墨导热层、金属网格与钛合金承载板。它决定了屏面平整度，也是折痕控制与散热路径的一部分。',
    repair: '支撑层与中框通过磁性定位销和粘合点对位。重装时必须使用专用治具校准平面度，否则会形成可见波纹或影响铰链闭合。'
  },
  {
    id: 'outerDisplay', no: '04', name: '外屏总成', en: 'Outer Display Assembly',
    category: 'exterior', spec: '5.4″ · 1398 × 2034 · 460 ppi', partNo: '661-DU04',
    anchor: [5.9, 2.45, -0.29], explode: [1.15, 0.45, -2.25], delay: 0.07,
    priority: 9, focusDistance: 12.5, view: 'back',
    specs: [['面板', '5.4″ Super Retina XDR'], ['分辨率', '1398 × 2034 / 460 ppi'], ['亮度', '3000 尼特峰值'], ['玻璃', 'Ceramic Shield 2']],
    desc: '折叠状态下使用的外部 OLED 屏，像素密度高于内屏，负责锁屏、通知与单手交互。屏幕与背板之间夹有超薄散热石墨片，顶部开孔对应 12MP 前摄。',
    repair: '外屏从中框内侧的排线接口断开后即可整体取下，是整机相对容易更换的模组；但加热过度会损伤下方天线与无线充电线圈。'
  },
  {
    id: 'backGlass', no: '05', name: '背板玻璃', en: 'Back Glass Panel',
    category: 'exterior', spec: '磨砂玻璃 · 相机岛开孔', partNo: '661-DU05',
    anchor: [-4.35, -3.55, -0.29], explode: [-0.95, 0.6, -2.05], delay: 0.04,
    priority: 7, focusDistance: 12.5, view: 'back',
    specs: [['材质', '磨砂强化玻璃'], ['颜色', 'Night Sky / Star White'], ['工艺', '光学镀膜 + 蚀刻'], ['开孔', '相机岛 / 闪光灯']],
    desc: '左半部背面的磨砂玻璃背板，内表面覆有散热膜与天线谐振结构。Apple 标志采用同一色系的真空镀膜，在哑光表面上保留微弱镜面反射。',
    repair: '背板通过防水胶条固定，需要加热后用吸盘配合撬片开启。更换后必须重做防水密封；拆下的背板容易在相机岛开孔处产生裂纹。'
  },
  {
    id: 'enclosure', no: '06', name: '钛金属中框', en: 'Titanium Enclosure',
    category: 'exterior', spec: 'Grade 5 titanium · IP68', partNo: '661-DU06',
    anchor: [-7.75, 4.25, 0.1], explode: [0, 0, 0.32], delay: 0.02,
    priority: 8, focusDistance: 22, view: 'front',
    specs: [['材料', 'Grade 5 钛合金'], ['展开厚度', '5.2 mm'], ['闭合厚度', '11.3 mm'], ['防护', 'IP68 · 6 m / 30 min']],
    desc: '左右两片独立钛金属中框，以中央铰链连接。边框内部集成天线断点、侧键安装座与防水结构；展开状态下最薄处只有 5.2 mm。',
    repair: '中框是整机的结构基准，绝大多数零件都安装在它上面。重度跌落导致框体变形时，即使更换屏幕也无法恢复平整度，需要整体更换框架。'
  },
  {
    id: 'hinge', no: '07', name: '折叠铰链', en: 'Variable-Torque Hinge',
    category: 'mechanical', spec: '100+ parts · 3D-printed titanium', partNo: '661-DU07',
    anchor: [0.15, -3.65, -0.12], explode: [0.15, 1.75, 0.7], delay: 0.0,
    priority: 9, focusDistance: 13, view: 'front',
    specs: [['零件数', '超过 100 件'], ['外盖', '3D 打印再生钛'], ['机构', '可变扭矩 + 磁吸阵列'], ['寿命', '官方 40 万次折叠']],
    desc: '整机最复杂的机械总成。多组凸轮、齿轮与片簧构成可变扭矩机构，在开合全程提供稳定阻尼；磁吸阵列帮助屏幕在 30°–120° 区间悬停。外露的铰链盖由 3D 打印再生钛制成。',
    repair: '铰链维修需要近乎完全拆解整机，是 iFixit 给出 5/10 可修复分的核心原因之一。进沙或跌落后出现的异响通常无法通过润滑单独解决。'
  },
  {
    id: 'logicBoard', no: '08', name: '主板总成', en: 'Logic Board Assembly',
    category: 'compute', spec: 'A20 Pro · 2 nm · 12 GB', partNo: '661-DU08',
    anchor: [-2.35, 1.6, 0.12], explode: [-1.25, 0.55, 0.92], delay: 0.08,
    priority: 9, focusDistance: 12, view: 'front',
    specs: [['芯片', 'A20 Pro · 2 nm'], ['CPU / GPU', '6 核 / 7 核'], ['神经引擎', '双 16 核'], ['内存', '12 GB LPDDR5X']],
    desc: '采用单层设计的折叠机主板，把 A20 Pro、C2 调制解调器与 N1 无线芯片布置在同一平面，避免双层堆叠带来的散热与维修难题。周围密布电源管理、NAND 与射频前端。',
    repair: '主板固定在左半部中框上，拆装前需断开电池、屏幕、相机与中缝排线。单层布局对维修友好，但板载芯片仍属于组件级维修，普通门店无法更换。'
  },
  {
    id: 'ioBoard', no: '09', name: '接口板', en: 'I/O Board',
    category: 'compute', spec: 'USB-C · 10 Gb/s', partNo: '661-DU09',
    anchor: [4.55, -4.85, 0.09], explode: [1.75, -1.65, 0.82], delay: 0.1,
    priority: 5, focusDistance: 8, view: 'front',
    specs: [['接口', 'USB-C'], ['速率', 'USB 3 · 10 Gb/s'], ['充电', '60 W 有线'], ['固定', '2 × T4 螺丝']],
    desc: '独立于主板的接口小板，承载 USB-C 母座、充电管理与底部天线馈点。可单独拆卸，是有线充电故障时最先检查的模块。',
    repair: '该板由两颗 T4 螺丝与一条压接排线固定，是整机少数真正模块化的部件。接口进水腐蚀时可单换，无需动主板。'
  },
  {
    id: 'battery1', no: '10', name: '电池 1', en: 'Battery 1',
    category: 'power', spec: '2962 mAh · 11.567 Wh', partNo: '661-DU10',
    anchor: [-4.65, -2.8, 0.14], explode: [-3.3, -0.65, 0.95], delay: 0.12,
    priority: 8, focusDistance: 10.5, view: 'front',
    specs: [['容量', '2962 mAh / 11.567 Wh'], ['电压', '3.87 V 标称'], ['化学体系', '锂离子聚合物'], ['固定', '电解除胶']],
    desc: '左半部的大容量电池组，占据背板与主板之间的主要空间。电池通过电解释放粘合剂固定，维修时施加低压电流即可让背胶失粘。',
    repair: '电解除胶大幅降低了撬电池的风险，但必须先拆下内屏并断开另一块电池。刺穿电芯会引发热失控，属于高风险操作。'
  },
  {
    id: 'battery2', no: '11', name: '电池 2', en: 'Battery 2',
    category: 'power', spec: '1921 mAh · 7.506 Wh', partNo: '661-DU11',
    anchor: [5.1, -1.55, 0.14], explode: [3.3, -0.65, 0.95], delay: 0.14,
    priority: 8, focusDistance: 9.5, view: 'front',
    specs: [['容量', '1921 mAh / 7.506 Wh'], ['总容量', '4883 mAh / 19.1 Wh'], ['无线充电', 'MagSafe / Qi2'], ['有线充电', '60 W · 20 分钟 50%']],
    desc: '分布在右半部的第二块电池，与电池 1 并联供电，使两侧重量与厚度更接近。双电池设计也把折叠后的重心推向铰链附近，改善单手握持感。',
    repair: '两块电池必须同时断电后拆卸，否则系统仍带电。更换时需重新校准电池健康数据，并检查无线充电线圈是否被背胶污染。'
  },
  {
    id: 'cameraModule', no: '12', name: '主摄模组', en: 'Fusion Camera Module',
    category: 'camera', spec: '48 MP ×2 · 26 mm / 13 mm', partNo: '661-DU12',
    anchor: [-5.0, 4.55, -0.48], explode: [0.1, 0.25, -3.55], delay: 0.03,
    priority: 10, focusDistance: 7.5, view: 'back',
    specs: [['主摄', '48 MP · 26 mm · ƒ/1.6'], ['超广角', '48 MP · 13 mm · ƒ/2.2'], ['防抖', '传感器位移式 OIS'], ['视频', '4K 120 Dolby Vision']],
    desc: '横向布置的双 48MP Fusion 相机岛。主摄采用传感器位移式防抖与大光圈，超广角提供 120° 视角；两颗传感器配合输出 2× 光学品质长焦与高分辨率微距。',
    repair: '相机岛从中框外侧嵌入，由独立排线连接主板。更换后需要专用校准流程恢复自动对焦与防抖；镜头蓝宝石玻璃可单独更换。'
  },
  {
    id: 'outerFrontCamera', no: '13', name: '外屏前摄', en: 'Outer Front Camera',
    category: 'camera', spec: '12 MP · ƒ/1.9', partNo: '661-DU13',
    anchor: [4.15, 4.75, -0.28], explode: [0.4, 0.55, -2.4], delay: 0.11,
    priority: 5, focusDistance: 4.8, view: 'back',
    specs: [['像素', '12 MP'], ['光圈', 'ƒ/1.9'], ['对焦', '自动对焦'], ['位置', '外屏顶部开孔']],
    desc: '折叠状态下的自拍与视频通话相机，嵌入右半部外屏顶部的开孔内。传感器尺寸与内屏前摄一致，但拥有更大的光圈。',
    repair: '需要先拆下外屏总成才能接触相机支架。镜头与 Face ID 传感区域邻近，操作时要避免划伤红外镀膜。'
  },
  {
    id: 'faceTimeCamera', no: '14', name: '屏下前摄', en: 'Under-display FaceTime Camera',
    category: 'camera', spec: '7.6″ UDC · 屏下成像', partNo: '661-DU14',
    anchor: [0.1, 4.7, 0.21], explode: [-0.35, 0.9, 2.15], delay: 0.16,
    priority: 5, focusDistance: 4.6, view: 'front',
    specs: [['类型', '屏下前摄'], ['像素', '12 MP'], ['光圈', 'ƒ/2.0'], ['特性', '像素补偿算法']],
    desc: '完全隐藏在 7.6 英寸内屏下方的 FaceTime 相机。屏幕在该区域降低像素密度并配合补偿算法，让光线穿过显示堆叠进入传感器，实现无开孔的全屏观感。',
    repair: '屏下相机与显示面板逐台配对，更换内屏后需要重新写入成像补偿参数，否则会出现局部色差或前摄雾化。'
  },
  {
    id: 'vaporChamber', no: '15', name: '均热板', en: 'Vapor Chamber',
    category: 'power', spec: '铜质 3D VC · 微通道', partNo: '661-DU15',
    anchor: [-3.45, 0.35, 0.15], explode: [-1.15, 0.55, 1.8], delay: 0.07,
    priority: 6, focusDistance: 10, view: 'front',
    specs: [['材质', '无氧铜'], ['结构', '3D 微通道 VC'], ['厚度', '约 0.35 mm'], ['覆盖', 'A20 / C2 / 电源']],
    desc: '贴合在主板与显示支撑层之间的超薄均热板，内部蚀刻出树状微通道，工作流体在蒸发与冷凝循环中把 A20 Pro 的热量摊平到整片铜板。',
    repair: '均热板与主板之间使用相变导热材料，一旦揭开就必须整套更换。形变会破坏内部蒸汽腔，导致高负载时明显降频。'
  },
  {
    id: 'tapticEngine', no: '16', name: '触感引擎', en: 'Taptic Engine',
    category: 'mechanical', spec: '线性马达 · 宽频触感', partNo: '661-DU16',
    anchor: [-1.65, -4.9, 0.16], explode: [-0.35, -2.2, 1.18], delay: 0.15,
    priority: 5, focusDistance: 5.2, view: 'front',
    specs: [['类型', '线性共振马达'], ['功能', '触感反馈 / Touch ID'], ['固定', '2 × 六角螺丝'], ['位置', '左半部底缘']],
    desc: '负责全机触感反馈的线性马达。它通过宽频驱动模拟按钮点击、滚轮刻度与系统提示；侧边 Touch ID 的按压反馈也由它与压感层协同完成。',
    repair: '由两颗六角螺丝固定，拆卸相对直接。但马达与中框之间存在精密间隙，重装时必须按扭矩规格锁紧，否则会产生共振噪音。'
  },
  {
    id: 'topSpeaker', no: '17', name: '顶部扬声器', en: 'Top Speaker',
    category: 'mechanical', spec: '立体声 · 顶部声道', partNo: '661-DU17',
    anchor: [-6.15, 5.45, 0.12], explode: [-0.75, 2.05, 1.05], delay: 0.18,
    priority: 5, focusDistance: 5.5, view: 'front',
    specs: [['类型', '全频扬声器'], ['系统', '立体声'], ['位置', '左半部顶缘'], ['密封', '声学泡棉']],
    desc: '左半部顶部的全频扬声器，与底部扬声器组成立体声场。折叠结构限制了音腔体积，Apple 通过更长的后腔导管与自适应均衡补偿低频。',
    repair: '扬声器由粘性泡棉与金属支架固定，拆下后泡棉不可复用。更换时需确认出声孔对齐，否则会明显损失高频。'
  },
  {
    id: 'bottomSpeaker', no: '18', name: '底部扬声器', en: 'Bottom Speaker',
    category: 'mechanical', spec: '立体声 · 底部声道', partNo: '661-DU18',
    anchor: [6.15, -5.45, 0.12], explode: [0.75, -2.05, 1.05], delay: 0.19,
    priority: 5, focusDistance: 5.5, view: 'front',
    specs: [['类型', '全频扬声器'], ['系统', '立体声'], ['位置', '右半部底缘'], ['防护', 'IP68 网罩']],
    desc: '右半部底缘的扬声器模块，与 USB-C 接口共享一条结构加强梁。网罩内部有疏水膜，可在 IP68 条件下平衡气压并阻挡液体。',
    repair: '模块化程度较高，但紧邻 USB-C 排线。拆卸时需先移开接口板，避免拉断底部天线馈线。'
  },
  {
    id: 'usbC', no: '19', name: 'USB-C 接口', en: 'USB-C Connector',
    category: 'compute', spec: 'USB 3 · 60 W · 10 Gb/s', partNo: '661-DU19',
    anchor: [4.6, -5.92, 0.02], explode: [1.15, -1.8, 0.92], delay: 0.12,
    priority: 6, focusDistance: 4.2, view: 'front',
    specs: [['标准', 'USB-C'], ['数据', 'USB 3 · 10 Gb/s'], ['供电', '最高 60 W'], ['防水', '独立密封圈']],
    desc: '底部居中的 USB-C 母座，支持 60W 有线快充与 10Gb/s 数据传输。接口后方有独立密封圈与两颗 T4 螺丝，是整机可维修性最好的模块之一。',
    repair: '接口模块可独立更换，无需拆下主板。清理时避免使用金属针具，舌片两侧的 24 个触点极其脆弱。'
  },
  {
    id: 'buttons', no: '20', name: '侧边按键', en: 'Side Button Array',
    category: 'mechanical', spec: 'Touch ID · Camera Control', partNo: '661-DU20',
    anchor: [-8.28, 1.5, 0.06], explode: [-2.35, 0.2, 0.42], delay: 0.17,
    priority: 6, focusDistance: 6.2, view: 'front',
    specs: [['电源键', 'Touch ID 指纹'], ['音量', '独立 +/- 键'], ['相机键', '压感 + 滑动'], ['材质', '钛金属']],
    desc: '分布在左右中框的外露按键。右侧电源键集成 Touch ID，下方 Camera Control 支持半按对焦、全按快门与滑动变焦；左侧为音量键与响铃开关。',
    repair: '按键通过防水膜与 FPC 连接到中框内侧，单独更换需要拆开对应半部。Touch ID 与安全隔区配对，第三方更换会失去指纹功能。'
  },
  {
    id: 'interposerFlex', no: '21', name: '中缝互联排线', en: 'Interposer Flex Cable',
    category: 'compute', spec: '多层 FPC · 双通道', partNo: '661-DU21',
    anchor: [0.15, 1.75, 0.13], explode: [0.55, 1.55, 2.25], delay: 0.21,
    priority: 6, focusDistance: 9, view: 'front',
    specs: [['类型', '多层柔性电路'], ['通道', '显示 / 电源 / 传感器'], ['弯折寿命', '40 万次'], ['路径', '穿过铰链中心']],
    desc: '穿过铰链中心、连接左右半部主板与显示组件的柔性排线。它在开合过程中形成可控的 S 形弯折，多层屏蔽结构确保高频信号在弯折区仍保持完整。',
    repair: '更换中缝排线几乎等同于拆解整机，需要分离内屏、铰链盖与两侧主板。折痕或显示闪烁常来自这里，而不是屏幕本身。'
  },
  {
    id: 'screws', no: '22', name: '紧固件组', en: 'Fastener Array',
    category: 'mechanical', spec: '47 fasteners · 5 drive types', partNo: '661-DU22',
    anchor: [6.65, -4.45, 0.24], explode: [0, 0, 0.3], delay: 0.25,
    priority: 4, focusDistance: 20, view: 'front',
    specs: [['总数', '47 颗'], ['类型', 'P2 / T4 / Y000 / PH00 / HEX'], ['材质', '不锈钢 / 钛'], ['最常用', 'T4 Torx']],
    desc: '全机 47 颗可见与内部紧固件，包含 4 种精密螺丝与 2 颗六角固定螺栓。不同位置使用不同驱动规格，是拆解时需要多种批头的原因。',
    repair: '建议按拆解顺序分格收纳。相机与铰链区域的螺丝长度相近但螺纹不同，混装可能顶穿中框或损坏排线。'
  }
];

// ------------------------------------------------------------
// Tiny DOM / math helpers
// ------------------------------------------------------------

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const clamp = (v, min, max) => Math.min(max, Math.max(min, v));
const lerp = (a, b, t) => a + (b - a) * t;
const smoothstep = (t) => {
  t = clamp(t, 0, 1);
  return t * t * (3 - 2 * t);
};
const easeOutCubic = (t) => 1 - Math.pow(1 - clamp(t, 0, 1), 3);
const nextFrame = () => new Promise((resolve) => requestAnimationFrame(() => setTimeout(resolve, 16)));
const isMobileLayout = () => window.innerWidth <= 1120;

function seededRandom(seed = 1) {
  let state = seed >>> 0;
  return function random() {
    state = (state * 1664525 + 1013904223) >>> 0;
    return state / 4294967296;
  };
}

function makeCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

function roundRectPath(ctx, x, y, w, h, r) {
  const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  ctx.lineTo(x + radius, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - radius);
  ctx.lineTo(x, y + radius);
  ctx.quadraticCurveTo(x, y, x + radius, y);
  ctx.closePath();
}

function fillRoundRect(ctx, x, y, w, h, r, fillStyle) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.fillStyle = fillStyle;
  ctx.fill();
  ctx.restore();
}

function strokeRoundRect(ctx, x, y, w, h, r, strokeStyle, lineWidth = 1) {
  ctx.save();
  roundRectPath(ctx, x, y, w, h, r);
  ctx.strokeStyle = strokeStyle;
  ctx.lineWidth = lineWidth;
  ctx.stroke();
  ctx.restore();
}

function setLoader(text) {
  const status = $('#loaderStatus');
  if (status) status.textContent = text;
}

function toast(message, duration = 2600) {
  const el = $('#toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  window.clearTimeout(toast._timer);
  toast._timer = window.setTimeout(() => el.classList.remove('is-visible'), duration);
}

// ------------------------------------------------------------
// Global state
// ------------------------------------------------------------

const state = {
  explodeTarget: 0,
  explodeCurrent: 0,
  selectedId: null,
  hoveredId: null,
  xray: false,
  dimensions: false,
  autoRotate: true,
  theme: 'night',
  cameraOn: false,
  view: 'front',
  ready: false
};

let renderer;
let scene;
let camera;
let controls;
let clock;
let raycaster;
let pointerNdc = new THREE.Vector2(-10, -10);
let device;
let dimensionsGroup;
let particleSystem;
let envMap;
let cameraTween = null;
let viewDistance = 28;
let introPlayed = false;

const parts = new Map();
const pickables = [];
const shellMaterials = [];
const themeMaterials = {
  frame: [],
  frameSide: [],
  backGlass: [],
  buttons: [],
  hinge: [],
  plateau: [],
  logo: []
};
const shellPartIds = new Set(['coverLayer', 'innerDisplay', 'displayPlate', 'enclosure', 'backGlass', 'outerDisplay']);
const selection = {
  partId: null,
  outlines: [],
  materials: []
};
const pointerState = {
  downX: 0,
  downY: 0,
  downTime: 0,
  moved: false,
  hovering: false,
  lastHoverCheck: 0
};
const labelMap = new Map();
const dimensionLabels = [];
let hoverTagEl;

// ------------------------------------------------------------
// Procedural textures
// ------------------------------------------------------------

function canvasTexture(canvas, { srgb = true, repeat = null, anisotropy = true } = {}) {
  const texture = new THREE.CanvasTexture(canvas);
  if (srgb) texture.colorSpace = THREE.SRGBColorSpace;
  texture.anisotropy = anisotropy && renderer ? renderer.capabilities.getMaxAnisotropy() : 1;
  if (repeat) {
    texture.wrapS = THREE.RepeatWrapping;
    texture.wrapT = THREE.RepeatWrapping;
    texture.repeat.set(repeat[0], repeat[1]);
  }
  texture.needsUpdate = true;
  return texture;
}

function createEnvironmentTexture() {
  const canvas = makeCanvas(1024, 512);
  const ctx = canvas.getContext('2d');

  const base = ctx.createLinearGradient(0, 0, 0, 512);
  base.addColorStop(0, '#0b141b');
  base.addColorStop(0.46, '#061016');
  base.addColorStop(1, '#020508');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  const glow = ctx.createRadialGradient(490, 240, 0, 490, 240, 390);
  glow.addColorStop(0, 'rgba(119, 193, 207, 0.16)');
  glow.addColorStop(0.48, 'rgba(42, 88, 103, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 512);

  const softbox = (x, y, w, h, color, alpha) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.filter = 'blur(28px)';
    ctx.globalAlpha = alpha;
    ctx.fillStyle = color;
    ctx.fillRect(-w / 2, -h / 2, w, h);
    ctx.restore();
  };

  softbox(160, 110, 270, 86, '#d9fbff', 0.9);
  softbox(808, 90, 150, 60, '#9bdcff', 0.48);
  softbox(510, 388, 380, 72, '#6cf2dc', 0.16);
  softbox(950, 330, 96, 100, '#ffb275', 0.26);
  softbox(42, 292, 80, 110, '#4971ff', 0.18);

  ctx.save();
  ctx.filter = 'blur(40px)';
  ctx.globalAlpha = 0.4;
  const horizon = ctx.createLinearGradient(0, 430, 0, 512);
  horizon.addColorStop(0, 'rgba(51, 106, 114, 0)');
  horizon.addColorStop(1, 'rgba(51, 106, 114, 0.35)');
  ctx.fillStyle = horizon;
  ctx.fillRect(0, 430, 1024, 82);
  ctx.restore();

  return canvas;
}

function createScreenTexture() {
  const canvas = makeCanvas(2400, 1704);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(2609);

  // Wallpaper: deep aquatic aurora
  const bg = ctx.createLinearGradient(0, 0, 2400, 1704);
  bg.addColorStop(0, '#06101a');
  bg.addColorStop(0.38, '#0a1b26');
  bg.addColorStop(0.68, '#0c1723');
  bg.addColorStop(1, '#051018');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 2400, 1704);

  const blobs = [
    [320, 260, 720, 'rgba(28, 117, 143, 0.50)'],
    [1960, 300, 820, 'rgba(72, 82, 175, 0.35)'],
    [1330, 900, 900, 'rgba(17, 118, 120, 0.26)'],
    [440, 1400, 760, 'rgba(53, 65, 147, 0.38)'],
    [2140, 1460, 760, 'rgba(142, 72, 86, 0.22)']
  ];
  ctx.save();
  ctx.globalCompositeOperation = 'lighter';
  for (const [x, y, r, color] of blobs) {
    const g = ctx.createRadialGradient(x, y, 0, x, y, r);
    g.addColorStop(0, color);
    g.addColorStop(0.52, color.replace(/0\.\d+\)/, '0.12)'));
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, 2400, 1704);
  }
  ctx.restore();

  // Fine aurora ribbons
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  for (let i = 0; i < 4; i++) {
    ctx.beginPath();
    ctx.moveTo(-100, 440 + i * 90);
    ctx.bezierCurveTo(540, 220 + i * 95, 1260, 770 + i * 50, 2520, 380 + i * 100);
    ctx.strokeStyle = `rgba(${70 + i * 11}, ${200 - i * 24}, ${190 - i * 18}, ${0.10 - i * 0.018})`;
    ctx.lineWidth = 2 + i * 2;
    ctx.stroke();
  }
  ctx.restore();

  // Grain
  for (let i = 0; i < 7000; i++) {
    const x = rnd() * 2400;
    const y = rnd() * 1704;
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.026})`;
    ctx.fillRect(x, y, 1.2, 1.2);
  }

  // Status bar
  const statusY = 67;
  ctx.save();
  ctx.fillStyle = 'rgba(244, 254, 255, 0.92)';
  ctx.font = '600 34px "SF Pro Display", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillText('9:41', 82, statusY);

  // right status cluster
  ctx.save();
  ctx.translate(2290, statusY);
  ctx.strokeStyle = 'rgba(244,254,255,0.88)';
  ctx.fillStyle = 'rgba(244,254,255,0.88)';
  ctx.lineWidth = 3;
  for (let b = 0; b < 4; b++) {
    const bh = 6 + b * 5;
    roundRectPath(ctx, -32 - b * 10, 8 - bh, 6, bh, 1.5);
    ctx.fill();
  }
  // wifi
  ctx.beginPath();
  ctx.arc(20, 4, 17, Math.PI * 1.16, Math.PI * 1.84);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(20, 4, 10, Math.PI * 1.18, Math.PI * 1.82);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(20, 4, 2.8, 0, Math.PI * 2);
  ctx.fill();
  // battery
  ctx.lineWidth = 3;
  roundRectPath(ctx, 56, -10, 44, 22, 5);
  ctx.stroke();
  ctx.fillRect(103, -3, 4, 8);
  roundRectPath(ctx, 61, -5, 30, 12, 2);
  ctx.fill();
  ctx.restore();

  // under-display camera hint
  ctx.beginPath();
  ctx.arc(1200, 62, 8, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(4, 11, 16, 0.7)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(120, 210, 220, 0.12)';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.restore();

  drawInnerWidgets(ctx, rnd);
  drawInnerAppPages(ctx);

  // Center fold crease
  const crease = ctx.createLinearGradient(1150, 0, 1250, 0);
  crease.addColorStop(0, 'rgba(0, 0, 0, 0)');
  crease.addColorStop(0.38, 'rgba(0, 5, 8, 0.1)');
  crease.addColorStop(0.49, 'rgba(0, 2, 5, 0.35)');
  crease.addColorStop(0.5, 'rgba(155, 239, 242, 0.14)');
  crease.addColorStop(0.51, 'rgba(0, 2, 5, 0.33)');
  crease.addColorStop(0.62, 'rgba(0, 5, 8, 0.1)');
  crease.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = crease;
  ctx.fillRect(1150, 0, 100, 1704);

  // soft vignette
  const vignette = ctx.createRadialGradient(1200, 840, 460, 1200, 840, 1580);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.72, 'rgba(0,4,8,0.12)');
  vignette.addColorStop(1, 'rgba(0,3,6,0.48)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 2400, 1704);

  return canvasTexture(canvas);
}

function drawInnerWidgets(ctx, rnd) {
  // Left weather widget
  ctx.save();
  const lx = 101;
  const ly = 126;
  const lw = 1010;
  const lh = 306;
  fillRoundRect(ctx, lx, ly, lw, lh, 48, 'rgba(9, 23, 31, 0.48)');
  strokeRoundRect(ctx, lx, ly, lw, lh, 48, 'rgba(202, 250, 255, 0.12)', 1.5);

  ctx.fillStyle = 'rgba(233, 255, 255, 0.76)';
  ctx.font = '500 25px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.fillText('深圳', lx + 50, ly + 38);
  ctx.font = '400 20px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillStyle = 'rgba(184, 220, 226, 0.56)';
  ctx.fillText('周五 · 10月23日', lx + 50, ly + 78);

  ctx.fillStyle = 'rgba(245, 255, 255, 0.96)';
  ctx.font = '300 118px "SF Pro Display", sans-serif';
  ctx.fillText('26°', lx + 56, ly + 122);

  ctx.font = '400 25px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillStyle = 'rgba(200, 237, 240, 0.7)';
  ctx.fillText('多云  最高 29° / 最低 22°', lx + 390, ly + 172);

  // weather chart
  ctx.save();
  ctx.translate(lx + 390, ly + 225);
  ctx.strokeStyle = 'rgba(142, 239, 233, 0.5)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  const points = [0, 18, 4, 32, 10, 25, 6, 40, 22, 28, 16];
  for (let i = 0; i < points.length; i++) {
    const x = i * 48;
    const y = -points[i];
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.stroke();
  ctx.fillStyle = 'rgba(142, 239, 233, 0.18)';
  ctx.lineTo(480, 28);
  ctx.lineTo(0, 28);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  // sun glyph
  ctx.save();
  ctx.translate(lx + 900, ly + 78);
  ctx.fillStyle = 'rgba(255, 211, 128, 0.86)';
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.42;
  for (let i = 0; i < 8; i++) {
    ctx.save();
    ctx.rotate((Math.PI * 2 * i) / 8);
    ctx.fillRect(-2, -48, 4, 12);
    ctx.restore();
  }
  ctx.restore();
  ctx.restore();

  // Right photo / memory widget
  ctx.save();
  const rx = 1289;
  const ry = 126;
  const rw = 1010;
  const rh = 306;
  fillRoundRect(ctx, rx, ry, rw, rh, 48, 'rgba(10, 18, 28, 0.45)');
  ctx.save();
  roundRectPath(ctx, rx, ry, rw, rh, 48);
  ctx.clip();
  const art = ctx.createLinearGradient(rx, ry, rx + rw, ry + rh);
  art.addColorStop(0, '#25444b');
  art.addColorStop(0.45, '#7c5d57');
  art.addColorStop(0.72, '#27334e');
  art.addColorStop(1, '#0e1b25');
  ctx.fillStyle = art;
  ctx.fillRect(rx, ry, rw, rh);

  for (let i = 0; i < 6; i++) {
    const bx = rx + 100 + rnd() * (rw - 200);
    const by = ry + 50 + rnd() * (rh - 100);
    const br = 60 + rnd() * 150;
    const g = ctx.createRadialGradient(bx, by, 0, bx, by, br);
    const hue = 20 + rnd() * 140;
    g.addColorStop(0, `hsla(${hue}, 56%, 64%, 0.45)`);
    g.addColorStop(1, 'rgba(0,0,0,0)');
    ctx.fillStyle = g;
    ctx.fillRect(bx - br, by - br, br * 2, br * 2);
  }
  ctx.strokeStyle = 'rgba(255,255,255,0.15)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(rx + 70, ry + 105 + i * 52);
    ctx.bezierCurveTo(rx + 300, ry + 50 + i * 40, rx + 600, ry + 170 + i * 30, rx + rw - 70, ry + 100 + i * 42);
    ctx.stroke();
  }
  ctx.restore();
  ctx.fillStyle = 'rgba(8, 14, 18, 0.4)';
  ctx.fillRect(rx, ry + rh - 100, rw, 100);
  ctx.fillStyle = 'rgba(249, 255, 255, 0.94)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '500 28px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillText('回忆 · 2026', rx + 38, ry + rh - 76);
  ctx.font = '400 19px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillStyle = 'rgba(210, 238, 241, 0.55)';
  ctx.fillText('深圳湾 · 黄昏', rx + 38, ry + rh - 39);
  ctx.restore();
}

function drawInnerAppPages(ctx) {
  const leftIcons = [
    ['phone', '电话', '#45d36b'], ['messages', '信息', '#46ce61'], ['safari', 'Safari', '#e9f3f5'], ['camera', '相机', '#7a838c'],
    ['photos', '照片', '#ece9df'], ['music', '音乐', '#ec5b60'], ['maps', '地图', '#79ba92'], ['mail', '邮件', '#4d9ff2'],
    ['clock', '时钟', '#15191f'], ['weather', '天气', '#4d9bed'], ['calendar', '日历', '#f3f1ec'], ['notes', '备忘录', '#f4c552'],
    ['appstore', 'App Store', '#5da4ee'], ['settings', '设置', '#687179'], ['wallet', '钱包', '#20262c'], ['files', '文件', '#4b9ce5']
  ];
  const rightIcons = [
    ['health', '健康', '#f06070'], ['podcasts', '播客', '#9b6bea'], ['tv', 'Apple TV', '#14191f'], ['books', '图书', '#e8a45b'],
    ['translate', '翻译', '#75a6f2'], ['shortcuts', '快捷指令', '#cb6de1'], ['home', '家庭', '#e3b164'], ['freeform', '无边记', '#4aa5ee'],
    ['contacts', '通讯录', '#8b9ca3'], ['facetime', 'FaceTime', '#58c568'], ['stocks', '股市', '#2a3138'], ['reminders', '提醒事项', '#ef8a84'],
    ['voice', '语音备忘录', '#1a1e24'], ['compass', '指南针', '#262c33'], ['measure', '测距仪', '#7f8b94'], ['tips', '提示', '#f3c346']
  ];
  drawAppGrid(ctx, 0, 482, leftIcons);
  drawAppGrid(ctx, 1200, 482, rightIcons);
  drawDock(ctx, 0, ['phone', 'safari', 'messages', 'music']);
  drawDock(ctx, 1200, ['camera', 'photos', 'maps', 'settings']);
}

function drawAppGrid(ctx, offsetX, startY, icons) {
  const cols = 4;
  const cellW = 252;
  const cellH = 258;
  const iconSize = 164;
  const startX = offsetX + 114;

  for (let i = 0; i < icons.length; i++) {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const x = startX + col * cellW + (cellW - iconSize) / 2;
    const y = startY + row * cellH;

    drawAppIcon(ctx, icons[i][0], icons[i][2], x, y, iconSize);

    ctx.save();
    ctx.fillStyle = 'rgba(238, 252, 253, 0.88)';
    ctx.font = '500 24px "SF Pro Text", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(icons[i][1], x + iconSize / 2, y + iconSize + 13);
    ctx.restore();
  }
}

function drawDock(ctx, offsetX, types) {
  const x = offsetX + 76;
  const y = 1510;
  const w = 1048;
  const h = 148;
  fillRoundRect(ctx, x, y, w, h, 44, 'rgba(206, 244, 244, 0.11)');
  strokeRoundRect(ctx, x, y, w, h, 44, 'rgba(223, 255, 255, 0.1)', 1.2);

  const colors = {
    phone: '#45d36b', safari: '#e9f3f5', messages: '#46ce61', music: '#ec5b60',
    camera: '#7a838c', photos: '#ece9df', maps: '#79ba92', settings: '#687179'
  };
  for (let i = 0; i < 4; i++) {
    const ix = x + 86 + i * 234;
    drawAppIcon(ctx, types[i], colors[types[i]], ix, y + 17, 114);
  }

  // home indicator on each page
  ctx.save();
  ctx.fillStyle = 'rgba(235, 252, 252, 0.74)';
  roundRectPath(ctx, offsetX + 510, 1680, 270, 8, 4);
  ctx.fill();
  ctx.restore();
}

function drawAppIcon(ctx, type, color, x, y, size) {
  const r = size * 0.235;
  ctx.save();
  ctx.shadowColor = 'rgba(0, 0, 0, 0.34)';
  ctx.shadowBlur = size * 0.08;
  ctx.shadowOffsetY = size * 0.025;

  const gradient = ctx.createLinearGradient(x, y, x + size, y + size);
  const derived = new THREE.Color(color);
  derived.offsetHSL(0.0, 0.0, 0.08);
  gradient.addColorStop(0, color);
  gradient.addColorStop(1, `#${derived.getHexString()}`);
  fillRoundRect(ctx, x, y, size, size, r, gradient);
  ctx.restore();

  strokeRoundRect(ctx, x, y, size, size, r, 'rgba(255,255,255,0.2)', Math.max(1, size * 0.008));

  ctx.save();
  roundRectPath(ctx, x, y, size, size, r);
  ctx.clip();
  const white = 'rgba(255,255,255,0.94)';
  const cx = x + size / 2;
  const cy = y + size / 2;
  const s = size;

  ctx.strokeStyle = white;
  ctx.fillStyle = white;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  if (type === 'phone') {
    ctx.save();
    ctx.translate(cx + s * 0.02, cy + s * 0.03);
    ctx.rotate(-Math.PI / 4);
    ctx.lineWidth = s * 0.09;
    ctx.beginPath();
    ctx.moveTo(-s * 0.19, -s * 0.2);
    ctx.quadraticCurveTo(-s * 0.27, -s * 0.05, -s * 0.13, s * 0.15);
    ctx.quadraticCurveTo(-s * 0.02, s * 0.29, s * 0.18, s * 0.2);
    ctx.stroke();
    ctx.fillStyle = 'rgba(255,255,255,0.94)';
    ctx.beginPath();
    ctx.ellipse(-s * 0.17, -s * 0.17, s * 0.09, s * 0.045, -0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(s * 0.17, s * 0.18, s * 0.09, s * 0.045, -0.65, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  } else if (type === 'messages') {
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.27, cy - s * 0.2);
    ctx.quadraticCurveTo(cx, cy - s * 0.29, cx + s * 0.28, cy - s * 0.13);
    ctx.quadraticCurveTo(cx + s * 0.35, cy + s * 0.08, cx + s * 0.13, cy + s * 0.16);
    ctx.quadraticCurveTo(cx + s * 0.03, cy + s * 0.2, cx - s * 0.06, cy + s * 0.27);
    ctx.quadraticCurveTo(cx - s * 0.07, cy + s * 0.15, cx - s * 0.16, cy + s * 0.13);
    ctx.quadraticCurveTo(cx - s * 0.35, cy + s * 0.02, cx - s * 0.27, cy - s * 0.2);
    ctx.fill();
  } else if (type === 'safari') {
    ctx.strokeStyle = 'rgba(36, 59, 68, 0.55)';
    ctx.lineWidth = s * 0.028;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.34, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(255,255,255,0.85)';
    ctx.lineWidth = s * 0.018;
    for (let i = 0; i < 36; i += 1) {
      const a = (i / 36) * Math.PI * 2;
      const r1 = s * 0.31;
      const r2 = s * 0.34;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
      ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
      ctx.stroke();
    }
    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(-0.6);
    ctx.fillStyle = '#e85058';
    ctx.beginPath();
    ctx.moveTo(-s * 0.02, -s * 0.29);
    ctx.lineTo(s * 0.13, 0);
    ctx.lineTo(-s * 0.02, s * 0.29);
    ctx.lineTo(-s * 0.07, s * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.rotate(Math.PI);
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.moveTo(-s * 0.02, -s * 0.29);
    ctx.lineTo(s * 0.13, 0);
    ctx.lineTo(-s * 0.02, s * 0.29);
    ctx.lineTo(-s * 0.07, s * 0.04);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  } else if (type === 'camera') {
    ctx.fillStyle = 'rgba(27, 33, 37, 0.95)';
    roundRectPath(ctx, cx - s * 0.31, cy - s * 0.22, s * 0.62, s * 0.44, s * 0.09);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(20, 26, 30, 0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = 'rgba(117, 206, 238, 0.7)';
    ctx.beginPath();
    ctx.arc(cx - s * 0.04, cy - s * 0.04, s * 0.035, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'photos') {
    const petals = ['#f5c649', '#ef6b6f', '#dd6de1', '#7288f0', '#69cbe0', '#65cf9d', '#f49c55', '#ed708f'];
    for (let i = 0; i < 8; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i / 8) * Math.PI * 2);
      ctx.fillStyle = petals[i];
      ctx.globalAlpha = 0.88;
      ctx.beginPath();
      ctx.ellipse(0, -s * 0.19, s * 0.095, s * 0.17, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.07, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'music') {
    ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.08, cy + s * 0.13);
    ctx.lineTo(cx + s * 0.08, cy - s * 0.23);
    ctx.lineTo(cx + s * 0.25, cy - s * 0.28);
    ctx.stroke();
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.ellipse(cx - s * 0.02, cy + s * 0.17, s * 0.12, s * 0.09, -0.35, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(cx + s * 0.22, cy + s * 0.1, s * 0.1, s * 0.075, -0.35, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'maps') {
    ctx.fillStyle = '#d3e7c9';
    roundRectPath(ctx, cx - s * 0.33, cy - s * 0.28, s * 0.66, s * 0.56, s * 0.05);
    ctx.fill();
    ctx.fillStyle = '#afd9e9';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.33, cy + s * 0.03);
    ctx.bezierCurveTo(cx - s * 0.08, cy + s * 0.14, cx + s * 0.05, cy + s * 0.03, cx + s * 0.33, cy + s * 0.15);
    ctx.lineTo(cx + s * 0.33, cy + s * 0.27);
    ctx.lineTo(cx - s * 0.33, cy + s * 0.27);
    ctx.closePath();
    ctx.fill();
    ctx.strokeStyle = 'rgba(255,255,255,0.9)';
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.22, cy + s * 0.3);
    ctx.quadraticCurveTo(cx - s * 0.02, cy + s * 0.05, cx + s * 0.16, cy - s * 0.3);
    ctx.stroke();
    ctx.strokeStyle = 'rgba(235, 190, 112, 0.9)';
    ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.02);
    ctx.lineTo(cx + s * 0.1, cy - s * 0.1);
    ctx.stroke();
    ctx.fillStyle = '#ef6f70';
    ctx.beginPath();
    ctx.arc(cx + s * 0.16, cy - s * 0.29, s * 0.055, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.16, cy - s * 0.01);
    ctx.lineTo(cx + s * 0.105, cy - s * 0.22);
    ctx.lineTo(cx + s * 0.215, cy - s * 0.22);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'mail') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.035;
    roundRectPath(ctx, cx - s * 0.3, cy - s * 0.19, s * 0.6, s * 0.39, s * 0.06);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.27, cy - s * 0.14);
    ctx.lineTo(cx, cy + s * 0.04);
    ctx.lineTo(cx + s * 0.27, cy - s * 0.14);
    ctx.stroke();
  } else if (type === 'clock') {
    ctx.fillStyle = '#f7f9f9';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.33, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#22282d';
    ctx.lineWidth = s * 0.02;
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(cx + Math.cos(a) * s * 0.26, cy + Math.sin(a) * s * 0.26);
      ctx.lineTo(cx + Math.cos(a) * s * 0.295, cy + Math.sin(a) * s * 0.295);
      ctx.stroke();
    }
    ctx.strokeStyle = '#e8824e';
    ctx.lineWidth = s * 0.022;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx + s * 0.15, cy - s * 0.12);
    ctx.stroke();
    ctx.strokeStyle = '#22282d';
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(cx - s * 0.02, cy - s * 0.19);
    ctx.stroke();
    ctx.fillStyle = '#e8824e';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.025, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'weather') {
    ctx.fillStyle = '#ffd26e';
    ctx.beginPath();
    ctx.arc(cx - s * 0.07, cy - s * 0.1, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.arc(cx - s * 0.05, cy + s * 0.03, s * 0.11, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.09, cy + s * 0.02, s * 0.15, 0, Math.PI * 2);
    ctx.arc(cx + s * 0.23, cy + s * 0.08, s * 0.1, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx - s * 0.05, cy + s * 0.03, s * 0.11, 0, Math.PI);
    ctx.fill();
  } else if (type === 'calendar') {
    ctx.fillStyle = '#f7f5f0';
    roundRectPath(ctx, cx - s * 0.29, cy - s * 0.27, s * 0.58, s * 0.55, s * 0.045);
    ctx.fill();
    ctx.fillStyle = '#f05f55';
    ctx.font = `600 ${s * 0.11}px "SF Pro Text", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    ctx.fillText('十月', cx, cy - s * 0.225);
    ctx.fillStyle = '#282d31';
    ctx.font = `300 ${s * 0.28}px "SF Pro Display", sans-serif`;
    ctx.fillText('23', cx, cy - s * 0.08);
    ctx.fillStyle = '#c96560';
    ctx.font = `500 ${s * 0.075}px "SF Pro Text", sans-serif`;
    ctx.fillText('周五', cx, cy + s * 0.2);
  } else if (type === 'notes') {
    ctx.fillStyle = '#faf5d9';
    roundRectPath(ctx, cx - s * 0.29, cy - s * 0.29, s * 0.58, s * 0.58, s * 0.05);
    ctx.fill();
    ctx.strokeStyle = 'rgba(190, 160, 70, 0.42)';
    ctx.lineWidth = s * 0.018;
    for (let i = 0; i < 4; i++) {
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.21, cy - s * 0.13 + i * s * 0.1);
      ctx.lineTo(cx + s * 0.2, cy - s * 0.13 + i * s * 0.1);
      ctx.stroke();
    }
  } else if (type === 'appstore') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.042;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.29, 0, Math.PI * 2);
    ctx.stroke();
    ctx.lineWidth = s * 0.045;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.14, cy + s * 0.15);
    ctx.lineTo(cx + s * 0.02, cy - s * 0.18);
    ctx.lineTo(cx + s * 0.17, cy + s * 0.15);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.18, cy + s * 0.07);
    ctx.lineTo(cx + s * 0.2, cy + s * 0.07);
    ctx.stroke();
  } else if (type === 'settings') {
    for (let i = 0; i < 10; i++) {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate((i / 10) * Math.PI * 2);
      roundRectPath(ctx, -s * 0.042, -s * 0.29, s * 0.084, s * 0.12, s * 0.02);
      ctx.fillStyle = 'rgba(231, 237, 239, 0.95)';
      ctx.fill();
      ctx.restore();
    }
    ctx.fillStyle = 'rgba(230, 235, 237, 0.96)';
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.22, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.11, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'wallet') {
    ctx.fillStyle = '#d8b565';
    roundRectPath(ctx, cx - s * 0.3, cy - s * 0.12, s * 0.56, s * 0.35, s * 0.05);
    ctx.fill();
    ctx.fillStyle = '#e5e9ea';
    roundRectPath(ctx, cx - s * 0.26, cy - s * 0.23, s * 0.56, s * 0.35, s * 0.05);
    ctx.fill();
    ctx.fillStyle = '#f05f55';
    roundRectPath(ctx, cx - s * 0.3, cy + s * 0.05, s * 0.62, s * 0.18, s * 0.04);
    ctx.fill();
  } else if (type === 'health') {
    ctx.fillStyle = '#ff5c76';
    ctx.beginPath();
    ctx.moveTo(cx, cy + s * 0.25);
    ctx.bezierCurveTo(cx - s * 0.37, cy + s * 0.02, cx - s * 0.25, cy - s * 0.28, cx, cy - s * 0.1);
    ctx.bezierCurveTo(cx + s * 0.25, cy - s * 0.28, cx + s * 0.37, cy + s * 0.02, cx, cy + s * 0.25);
    ctx.fill();
  } else if (type === 'files') {
    ctx.fillStyle = 'rgba(255,255,255,0.92)';
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy - s * 0.18);
    ctx.quadraticCurveTo(cx - s * 0.3, cy - s * 0.25, cx - s * 0.21, cy - s * 0.25);
    ctx.lineTo(cx - s * 0.05, cy - s * 0.25);
    ctx.lineTo(cx + s * 0.02, cy - s * 0.17);
    ctx.lineTo(cx + s * 0.27, cy - s * 0.17);
    ctx.quadraticCurveTo(cx + s * 0.31, cy - s * 0.17, cx + s * 0.31, cy - s * 0.1);
    ctx.lineTo(cx + s * 0.25, cy + s * 0.24);
    ctx.quadraticCurveTo(cx + s * 0.24, cy + s * 0.3, cx + s * 0.17, cy + s * 0.3);
    ctx.lineTo(cx - s * 0.27, cy + s * 0.3);
    ctx.quadraticCurveTo(cx - s * 0.31, cy + s * 0.3, cx - s * 0.3, cy + s * 0.22);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'podcasts') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.035;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.11, 0, Math.PI * 2);
    ctx.stroke();
    for (let i = 1; i <= 3; i++) {
      ctx.beginPath();
      ctx.arc(cx, cy, s * (0.11 + i * 0.07), -Math.PI * 0.32, Math.PI * 0.32);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(cx, cy, s * (0.11 + i * 0.07), Math.PI * 0.68, Math.PI * 1.32);
      ctx.stroke();
    }
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.045, 0, Math.PI * 2);
    ctx.fill();
  } else if (type === 'tv') {
    ctx.fillStyle = white;
    ctx.font = `600 ${s * 0.27}px "SF Pro Display", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('tv', cx, cy + s * 0.02);
  } else if (type === 'books') {
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.29, cy - s * 0.22);
    ctx.quadraticCurveTo(cx - s * 0.1, cy - s * 0.28, cx, cy - s * 0.16);
    ctx.lineTo(cx, cy + s * 0.26);
    ctx.quadraticCurveTo(cx - s * 0.13, cy + s * 0.16, cx - s * 0.29, cy + s * 0.2);
    ctx.closePath();
    ctx.fill();
    ctx.globalAlpha = 0.78;
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.29, cy - s * 0.22);
    ctx.quadraticCurveTo(cx + s * 0.1, cy - s * 0.28, cx, cy - s * 0.16);
    ctx.lineTo(cx, cy + s * 0.26);
    ctx.quadraticCurveTo(cx + s * 0.13, cy + s * 0.16, cx + s * 0.29, cy + s * 0.2);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'translate') {
    ctx.fillStyle = white;
    ctx.font = `600 ${s * 0.22}px "SF Pro Text", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('文', cx - s * 0.1, cy - s * 0.06);
    ctx.fillStyle = '#1d2328';
    ctx.font = `600 ${s * 0.18}px "SF Pro Text", sans-serif`;
    ctx.fillText('A', cx + s * 0.14, cy + s * 0.13);
  } else if (type === 'shortcuts') {
    ctx.fillStyle = white;
    ctx.fillRect(cx - s * 0.25, cy - s * 0.1, s * 0.5, s * 0.052);
    ctx.fillRect(cx + s * 0.06, cy - s * 0.25, s * 0.052, s * 0.5);
    ctx.fillRect(cx - s * 0.12, cy + s * 0.18, s * 0.24, s * 0.052);
  } else if (type === 'home') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.04;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.25, cy - s * 0.02);
    ctx.lineTo(cx, cy - s * 0.28);
    ctx.lineTo(cx + s * 0.25, cy - s * 0.02);
    ctx.stroke();
    ctx.strokeRect(cx - s * 0.19, cy - s * 0.04, s * 0.38, s * 0.3);
  } else if (type === 'freeform') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.03;
    roundRectPath(ctx, cx - s * 0.27, cy - s * 0.25, s * 0.54, s * 0.5, s * 0.05);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.17, cy + s * 0.07);
    ctx.bezierCurveTo(cx - s * 0.05, cy - s * 0.2, cx + s * 0.08, cy + s * 0.18, cx + s * 0.2, cy - s * 0.08);
    ctx.stroke();
  } else if (type === 'facetime') {
    ctx.fillStyle = white;
    roundRectPath(ctx, cx - s * 0.29, cy - s * 0.19, s * 0.37, s * 0.38, s * 0.06);
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.1, cy - s * 0.02);
    ctx.lineTo(cx + s * 0.28, cy - s * 0.17);
    ctx.lineTo(cx + s * 0.28, cy + s * 0.17);
    ctx.lineTo(cx + s * 0.1, cy + s * 0.02);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'contacts') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.035;
    ctx.fillStyle = 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.arc(cx, cy - s * 0.11, s * 0.13, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(cx, cy + s * 0.3, s * 0.26, Math.PI * 1.04, Math.PI * 1.96);
    ctx.stroke();
  } else if (type === 'stocks') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.026;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.3, cy + s * 0.17);
    ctx.lineTo(cx - s * 0.16, cy + s * 0.02);
    ctx.lineTo(cx - s * 0.03, cy + s * 0.1);
    ctx.lineTo(cx + s * 0.12, cy - s * 0.12);
    ctx.lineTo(cx + s * 0.3, cy - s * 0.25);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(cx + s * 0.12, cy + s * 0.23);
    ctx.lineTo(cx + s * 0.3, cy + s * 0.23);
    ctx.stroke();
  } else if (type === 'reminders') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.03;
    for (let i = 0; i < 3; i++) {
      ctx.beginPath();
      ctx.arc(cx - s * 0.22, cy - s * 0.18 + i * s * 0.18, s * 0.045, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.08, cy - s * 0.18 + i * s * 0.18);
      ctx.lineTo(cx + s * 0.23, cy - s * 0.18 + i * s * 0.18);
      ctx.stroke();
    }
  } else if (type === 'voice') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.024;
    for (let i = 0; i < 11; i++) {
      const h = s * (0.05 + Math.sin(i * 1.7) * 0.08 + (i === 5 ? 0.13 : 0));
      ctx.beginPath();
      ctx.moveTo(cx - s * 0.23 + i * s * 0.046, cy - h);
      ctx.lineTo(cx - s * 0.23 + i * s * 0.046, cy + h);
      ctx.stroke();
    }
  } else if (type === 'compass') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.025;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.28, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#f05f55';
    ctx.beginPath();
    ctx.moveTo(cx, cy - s * 0.23);
    ctx.lineTo(cx + s * 0.07, cy);
    ctx.lineTo(cx, cy + s * 0.22);
    ctx.lineTo(cx - s * 0.07, cy);
    ctx.closePath();
    ctx.fill();
    ctx.fillStyle = white;
    ctx.font = `500 ${s * 0.06}px "SF Pro Text", sans-serif`;
    ctx.textAlign = 'center';
    ctx.fillText('N', cx, cy - s * 0.15);
  } else if (type === 'measure') {
    ctx.strokeStyle = white;
    ctx.lineWidth = s * 0.03;
    ctx.beginPath();
    ctx.moveTo(cx - s * 0.29, cy + s * 0.2);
    ctx.lineTo(cx + s * 0.29, cy - s * 0.2);
    ctx.stroke();
    for (let i = 0; i < 5; i++) {
      const t = i / 4;
      const x = cx - s * 0.22 + t * s * 0.44;
      const y = cy + s * 0.15 - t * s * 0.3;
      ctx.beginPath();
      ctx.moveTo(x - s * 0.02, y + s * 0.03);
      ctx.lineTo(x + s * 0.04, y - s * 0.04);
      ctx.stroke();
    }
  } else if (type === 'tips') {
    ctx.fillStyle = white;
    ctx.beginPath();
    ctx.arc(cx, cy, s * 0.27, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#f3c346';
    ctx.font = `600 ${s * 0.33}px "SF Pro Display", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText('✦', cx, cy + s * 0.01);
  } else {
    ctx.fillStyle = white;
    ctx.font = `500 ${s * 0.29}px "SF Pro Display", sans-serif`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(type.slice(0, 1).toUpperCase(), cx, cy);
  }

  ctx.restore();
}

function createOuterScreenTexture() {
  const canvas = makeCanvas(1200, 1746);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(1977);

  const bg = ctx.createLinearGradient(0, 0, 300, 1746);
  bg.addColorStop(0, '#071018');
  bg.addColorStop(0.42, '#0b222b');
  bg.addColorStop(0.72, '#13333a');
  bg.addColorStop(1, '#071015');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1200, 1746);

  // horizon glow
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const glow = ctx.createRadialGradient(930, 1240, 0, 930, 1240, 840);
  glow.addColorStop(0, 'rgba(238, 170, 95, 0.5)');
  glow.addColorStop(0.28, 'rgba(213, 118, 74, 0.21)');
  glow.addColorStop(0.65, 'rgba(66, 113, 119, 0.08)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1200, 1746);

  const teal = ctx.createRadialGradient(230, 700, 0, 230, 700, 800);
  teal.addColorStop(0, 'rgba(58, 151, 159, 0.36)');
  teal.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = teal;
  ctx.fillRect(0, 0, 1200, 1746);
  ctx.restore();

  // horizon ridge
  ctx.beginPath();
  ctx.moveTo(0, 1310);
  ctx.bezierCurveTo(250, 1240, 430, 1330, 700, 1260);
  ctx.bezierCurveTo(930, 1200, 1080, 1270, 1200, 1210);
  ctx.lineTo(1200, 1746);
  ctx.lineTo(0, 1746);
  ctx.closePath();
  const ridge = ctx.createLinearGradient(0, 1200, 0, 1746);
  ridge.addColorStop(0, 'rgba(3, 12, 17, 0.54)');
  ridge.addColorStop(1, 'rgba(1, 6, 10, 0.95)');
  ctx.fillStyle = ridge;
  ctx.fill();

  for (let i = 0; i < 2800; i++) {
    ctx.fillStyle = `rgba(255,255,255,${rnd() * 0.035})`;
    ctx.fillRect(rnd() * 1200, rnd() * 1746, 1.2, 1.2);
  }

  // Dynamic Island / camera opening
  ctx.save();
  ctx.fillStyle = '#020506';
  roundRectPath(ctx, 496, 26, 208, 58, 29);
  ctx.fill();
  const glint = ctx.createRadialGradient(578, 44, 0, 578, 44, 24);
  glint.addColorStop(0, 'rgba(49, 86, 108, 0.55)');
  glint.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = glint;
  ctx.beginPath();
  ctx.arc(578, 54, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // status icons top
  ctx.fillStyle = 'rgba(240, 251, 252, 0.88)';
  ctx.strokeStyle = 'rgba(240, 251, 252, 0.88)';
  ctx.lineWidth = 2.4;
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.font = '500 23px "SF Pro Text", sans-serif';
  ctx.fillText('5G', 60, 55);
  for (let b = 0; b < 4; b++) {
    const bh = 4 + b * 3.5;
    roundRectPath(ctx, 103 + b * 7, 64 - bh, 4, bh, 1.2);
    ctx.fill();
  }
  ctx.save();
  ctx.translate(1125, 55);
  roundRectPath(ctx, -38, -8, 31, 16, 4);
  ctx.stroke();
  ctx.fillRect(30, -3, 3, 6);
  ctx.restore();

  // date & time
  ctx.save();
  ctx.textAlign = 'center';
  ctx.fillStyle = 'rgba(238, 252, 252, 0.9)';
  ctx.font = '500 34px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillText('10月23日 星期五', 600, 235);

  ctx.fillStyle = 'rgba(245, 255, 255, 0.97)';
  ctx.font = '200 280px "SF Pro Display", "Helvetica Neue", sans-serif';
  ctx.letterSpacing = '-18px';
  ctx.fillText('9:41', 606, 500);

  ctx.fillStyle = 'rgba(234, 252, 252, 0.82)';
  ctx.font = '400 29px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillText('深圳 · 26°  多云', 600, 590);
  ctx.restore();

  // weather / calendar widget card
  const wx = 88;
  const wy = 680;
  const ww = 1024;
  const wh = 248;
  fillRoundRect(ctx, wx, wy, ww, wh, 38, 'rgba(4, 18, 24, 0.36)');
  strokeRoundRect(ctx, wx, wy, ww, wh, 38, 'rgba(211, 255, 255, 0.1)', 1.2);

  ctx.fillStyle = 'rgba(238, 255, 255, 0.82)';
  ctx.font = '500 23px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.textAlign = 'left';
  ctx.fillText('今天', wx + 38, wy + 48);
  ctx.fillStyle = 'rgba(250, 255, 255, 0.96)';
  ctx.font = '300 78px "SF Pro Display", sans-serif';
  ctx.fillText('26°', wx + 38, wy + 138);
  ctx.fillStyle = 'rgba(198, 238, 240, 0.68)';
  ctx.font = '400 22px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillText('最高 29°  ·  最低 22°', wx + 38, wy + 185);

  // hourly forecast
  ctx.save();
  ctx.translate(wx + 480, wy + 44);
  const hours = ['现在', '14时', '15时', '16时', '17时'];
  const temps = ['26°', '28°', '28°', '27°', '25°'];
  for (let i = 0; i < 5; i++) {
    const x = i * 104;
    ctx.fillStyle = 'rgba(207, 238, 240, 0.58)';
    ctx.font = '400 17px "SF Pro Text", "PingFang SC", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(hours[i], x, 0);
    ctx.fillStyle = i === 0 ? '#ffd277' : 'rgba(216, 252, 252, 0.8)';
    ctx.beginPath();
    ctx.arc(x, 48, 13, 0, Math.PI * 2);
    ctx.fill();
    if (i > 1) {
      ctx.fillStyle = 'rgba(216, 252, 252, 0.55)';
      roundRectPath(ctx, x - 8, 60, 16, 7, 3.5);
      ctx.fill();
    }
    ctx.fillStyle = 'rgba(243, 255, 255, 0.86)';
    ctx.font = '500 22px "SF Pro Text", sans-serif';
    ctx.fillText(temps[i], x, 112);
  }
  ctx.restore();

  // notification card
  const nx = 88;
  const ny = 986;
  const nw = 1024;
  const nh = 150;
  fillRoundRect(ctx, nx, ny, nw, nh, 32, 'rgba(228, 248, 248, 0.11)');
  strokeRoundRect(ctx, nx, ny, nw, nh, 32, 'rgba(230, 255, 255, 0.1)', 1.1);
  const msgGrad = ctx.createLinearGradient(nx + 26, ny + 29, nx + 108, ny + 111);
  msgGrad.addColorStop(0, '#5bdc75');
  msgGrad.addColorStop(1, '#2ebd52');
  fillRoundRect(ctx, nx + 26, ny + 29, 82, 82, 20, msgGrad);
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 6;
  ctx.beginPath();
  ctx.arc(nx + 67, ny + 68, 23, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(246, 255, 255, 0.94)';
  ctx.textAlign = 'left';
  ctx.font = '500 21px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillText('信息', nx + 134, ny + 48);
  ctx.font = '400 24px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.fillStyle = 'rgba(231, 251, 252, 0.76)';
  ctx.fillText('Jony：拆解图准备好了，随时可以开始。', nx + 134, ny + 88);
  ctx.font = '400 18px "SF Pro Text", sans-serif';
  ctx.fillStyle = 'rgba(217, 241, 242, 0.42)';
  ctx.fillText('现在', nx + 134, ny + 122);

  // music card
  const mx = 88;
  const my = 1170;
  fillRoundRect(ctx, mx, my, 1024, 148, 32, 'rgba(4, 14, 19, 0.3)');
  const album = ctx.createLinearGradient(mx + 24, my + 24, mx + 124, my + 124);
  album.addColorStop(0, '#ca7d61');
  album.addColorStop(0.5, '#2a4855');
  album.addColorStop(1, '#182b3d');
  fillRoundRect(ctx, mx + 24, my + 24, 100, 100, 20, album);
  ctx.strokeStyle = 'rgba(232, 253, 253, 0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(mx + 74, my + 74, 24, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillStyle = 'rgba(244, 255, 255, 0.9)';
  ctx.font = '500 22px "SF Pro Text", sans-serif';
  ctx.fillText('Afterglow', mx + 154, my + 56);
  ctx.fillStyle = 'rgba(208, 235, 237, 0.54)';
  ctx.font = '400 19px "SF Pro Text", sans-serif';
  ctx.fillText('Duct Tape Theory', mx + 154, my + 87);
  ctx.fillStyle = 'rgba(220, 250, 250, 0.26)';
  roundRectPath(ctx, mx + 154, my + 112, 790, 4, 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(222, 253, 253, 0.75)';
  roundRectPath(ctx, mx + 154, my + 112, 330, 4, 2);
  ctx.fill();

  // bottom controls
  const by = 1430;
  ctx.fillStyle = 'rgba(7, 17, 22, 0.48)';
  ctx.strokeStyle = 'rgba(225, 252, 252, 0.16)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(150, by, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1050, by, 46, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // flashlight icon
  ctx.fillStyle = 'rgba(242, 255, 255, 0.88)';
  roundRectPath(ctx, 138, by - 18, 24, 15, 5);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(144, by - 3);
  ctx.lineTo(156, by - 3);
  ctx.lineTo(160, by + 20);
  ctx.lineTo(140, by + 20);
  ctx.closePath();
  ctx.fill();
  // camera icon
  ctx.strokeStyle = 'rgba(242, 255, 255, 0.88)';
  ctx.lineWidth = 3;
  roundRectPath(ctx, 1024, by - 17, 52, 34, 8);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(1050, by, 9, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = 'rgba(225, 253, 253, 0.62)';
  ctx.font = '400 18px "SF Pro Text", "PingFang SC", sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('向上轻扫以解锁', 600, 1570);

  ctx.fillStyle = 'rgba(236, 255, 255, 0.8)';
  roundRectPath(ctx, 420, 1678, 360, 8, 4);
  ctx.fill();

  // vignette
  const vignette = ctx.createRadialGradient(600, 850, 300, 600, 850, 1040);
  vignette.addColorStop(0, 'rgba(0,0,0,0)');
  vignette.addColorStop(0.75, 'rgba(0,5,8,0.12)');
  vignette.addColorStop(1, 'rgba(0,3,6,0.46)');
  ctx.fillStyle = vignette;
  ctx.fillRect(0, 0, 1200, 1746);

  return canvasTexture(canvas);
}

function createPcbTexture() {
  const canvas = makeCanvas(1024, 512);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(8823);

  const bg = ctx.createLinearGradient(0, 0, 1024, 512);
  bg.addColorStop(0, '#0d1a16');
  bg.addColorStop(0.45, '#0a1713');
  bg.addColorStop(1, '#0c1715');
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, 1024, 512);

  // copper pour blocks
  ctx.save();
  ctx.globalAlpha = 0.34;
  for (let i = 0; i < 18; i++) {
    ctx.fillStyle = i % 3 === 0 ? '#5e4722' : '#1d3428';
    const x = rnd() * 1024;
    const y = rnd() * 512;
    const w = 20 + rnd() * 120;
    const h = 12 + rnd() * 60;
    roundRectPath(ctx, x, y, w, h, 3);
    ctx.fill();
  }
  ctx.restore();

  // trace grid
  ctx.lineWidth = 1;
  ctx.strokeStyle = 'rgba(126, 154, 97, 0.2)';
  for (let x = 0; x < 1024; x += 32) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, 512);
    ctx.stroke();
  }
  for (let y = 0; y < 512; y += 32) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(1024, y);
    ctx.stroke();
  }

  // random copper traces
  for (let i = 0; i < 100; i++) {
    let x = Math.round(rnd() * 1024);
    let y = Math.round(rnd() * 512);
    ctx.strokeStyle = rnd() > 0.25 ? 'rgba(185, 148, 91, 0.45)' : 'rgba(88, 148, 108, 0.36)';
    ctx.lineWidth = rnd() > 0.8 ? 2 : 1;
    ctx.beginPath();
    ctx.moveTo(x, y);
    const steps = 2 + Math.floor(rnd() * 5);
    for (let s = 0; s < steps; s++) {
      if (rnd() > 0.45) x += (rnd() > 0.5 ? 1 : -1) * (12 + Math.round(rnd() * 55));
      else y += (rnd() > 0.5 ? 1 : -1) * (12 + Math.round(rnd() * 42));
      x = clamp(x, 0, 1024);
      y = clamp(y, 0, 512);
      ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (rnd() > 0.55) {
      ctx.fillStyle = 'rgba(216, 176, 106, 0.75)';
      ctx.beginPath();
      ctx.arc(x, y, 2.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.75)';
      ctx.beginPath();
      ctx.arc(x, y, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // pads
  for (let i = 0; i < 80; i++) {
    const x = rnd() > 0.5 ? 60 + rnd() * 240 : 860 + rnd() * 110;
    const y = 40 + rnd() * 420;
    ctx.fillStyle = 'rgba(206, 168, 98, 0.72)';
    ctx.fillRect(x, y, 9, 4);
    ctx.fillStyle = 'rgba(255, 229, 158, 0.24)';
    ctx.fillRect(x + 1, y + 1, 7, 1.5);
  }

  // silkscreen
  ctx.fillStyle = 'rgba(215, 229, 211, 0.4)';
  ctx.font = '500 13px "SF Mono", monospace';
  ctx.fillText('IPHONE DUO  MLB  2026', 64, 60);
  ctx.font = '400 9px "SF Mono", monospace';
  ctx.fillStyle = 'rgba(209, 225, 208, 0.26)';
  ctx.fillText('APPLE INC.  CALIFORNIA', 64, 78);
  ctx.fillText('A20-PRO / C2 / N1', 64, 92);
  ctx.fillText('SN 26DUO-0081-A3', 64, 106);

  // barcode
  ctx.save();
  ctx.translate(760, 42);
  for (let i = 0; i < 52; i++) {
    ctx.fillStyle = rnd() > 0.65 ? 'rgba(231, 237, 224, 0.38)' : 'rgba(231, 237, 224, 0.12)';
    ctx.fillRect(i * 3.2, 0, rnd() > 0.55 ? 1.4 : 0.7, 28);
  }
  ctx.restore();

  // board keepouts / vias clusters
  ctx.fillStyle = 'rgba(3, 8, 7, 0.35)';
  for (let i = 0; i < 7; i++) {
    roundRectPath(ctx, 80 + rnd() * 820, 150 + rnd() * 300, 40 + rnd() * 65, 28 + rnd() * 50, 2);
    ctx.fill();
  }

  return canvasTexture(canvas);
}

function createBatteryTexture(variant = 1) {
  const canvas = makeCanvas(1024, 768);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(variant === 1 ? 9923 : 3812);
  const isFirst = variant === 1;

  ctx.fillStyle = '#0d1114';
  ctx.fillRect(0, 0, 1024, 768);
  const base = ctx.createLinearGradient(0, 0, 1024, 768);
  base.addColorStop(0, 'rgba(35, 42, 46, 0.42)');
  base.addColorStop(0.5, 'rgba(11, 15, 18, 0)');
  base.addColorStop(1, 'rgba(35, 42, 46, 0.3)');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 768);

  // subtle brushed diagonals
  ctx.save();
  ctx.globalAlpha = 0.09;
  for (let x = -768; x < 1300; x += 9) {
    ctx.strokeStyle = x % 27 === 0 ? '#c3d2d3' : '#4a565b';
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 300, 768);
    ctx.stroke();
  }
  ctx.restore();

  // caution stripe
  ctx.save();
  ctx.beginPath();
  ctx.rect(0, 0, 1024, 72);
  ctx.clip();
  ctx.fillStyle = '#c88443';
  ctx.fillRect(0, 0, 1024, 72);
  ctx.fillStyle = '#14100a';
  for (let x = -100; x < 1120; x += 64) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x + 26, 0);
    ctx.lineTo(x + 26 - 44, 72);
    ctx.lineTo(x - 44, 72);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();

  ctx.fillStyle = 'rgba(244, 246, 240, 0.94)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = '500 20px "SF Pro Text", "Helvetica Neue", sans-serif';
  ctx.fillText('iPhone Duo', 62, 132);
  ctx.fillStyle = 'rgba(198, 213, 213, 0.52)';
  ctx.font = '400 14px "SF Mono", monospace';
  ctx.fillText(isFirst ? 'BATTERY 1  /  A3-DUO-01' : 'BATTERY 2  /  A3-DUO-02', 62, 156);

  ctx.fillStyle = 'rgba(245, 249, 245, 0.94)';
  ctx.font = '300 112px "SF Pro Display", "Helvetica Neue", sans-serif';
  ctx.fillText(isFirst ? '11.567' : '7.506', 60, 290);
  ctx.fillStyle = 'rgba(212, 230, 229, 0.65)';
  ctx.font = '400 32px "SF Pro Display", sans-serif';
  ctx.fillText('Wh', 270, 290);

  ctx.fillStyle = 'rgba(238, 246, 244, 0.84)';
  ctx.font = '500 30px "SF Pro Text", sans-serif';
  ctx.fillText(isFirst ? '2962 mAh' : '1921 mAh', 62, 340);

  ctx.fillStyle = 'rgba(190, 210, 210, 0.56)';
  ctx.font = '400 18px "SF Pro Text", sans-serif';
  ctx.fillText('3.87 V  ⎓  7.51 V max', 62, 374);
  ctx.fillText('锂离子聚合物电池 / Li-ion Polymer', 62, 404);
  ctx.fillText('不可拆卸 · 仅限授权维修', 62, 432);

  // small spec lines
  ctx.strokeStyle = 'rgba(217, 235, 234, 0.13)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(62, 466);
  ctx.lineTo(600, 466);
  ctx.stroke();

  ctx.fillStyle = 'rgba(199, 219, 218, 0.42)';
  ctx.font = '400 13px "SF Mono", monospace';
  ctx.fillText('CELL BALANCE: DUAL-PACK / ELECTRIC ADHESIVE RELEASE', 62, 495);
  ctx.fillText('SERVICE: DISCONNECT BOTH PACKS BEFORE REPAIR', 62, 518);
  ctx.fillText('ASSEMBLED IN CHINA  ·  DESIGNED BY APPLE IN CALIFORNIA', 62, 541);

  // regulatory marks
  ctx.strokeStyle = 'rgba(213, 231, 227, 0.3)';
  ctx.lineWidth = 2;
  ctx.strokeRect(64, 586, 72, 38);
  ctx.fillStyle = 'rgba(213, 231, 227, 0.42)';
  ctx.font = '500 13px "SF Pro Text", sans-serif';
  ctx.fillText('CE', 90, 611);
  ctx.strokeRect(152, 586, 38, 38);
  ctx.fillText('FCC', 201, 611);
  ctx.beginPath();
  ctx.arc(290, 606, 19, 0, Math.PI * 2);
  ctx.stroke();
  ctx.fillText('Li', 284, 611);

  // QR / barcode block
  ctx.fillStyle = 'rgba(232, 239, 233, 0.55)';
  for (let row = 0; row < 13; row++) {
    for (let col = 0; col < 13; col++) {
      if (rnd() > 0.55) ctx.fillRect(716 + col * 9, 112 + row * 9, 7, 7);
    }
  }
  ctx.fillStyle = 'rgba(234, 243, 237, 0.4)';
  for (let i = 0; i < 70; i++) {
    ctx.fillRect(720 + i * 3.5, 258, i % 5 === 0 ? 2 : 1, 36);
  }
  ctx.fillStyle = 'rgba(206, 224, 222, 0.46)';
  ctx.font = '400 11px "SF Mono", monospace';
  ctx.fillText(isFirst ? '11.567Wh · 2962mAh' : '7.506Wh · 1921mAh', 720, 324);
  ctx.fillText('MODEL A3288', 720, 344);

  // pull tab
  ctx.fillStyle = '#b26f36';
  roundRectPath(ctx, 700, 640, 252, 68, 10);
  ctx.fill();
  ctx.fillStyle = 'rgba(18, 12, 8, 0.75)';
  ctx.font = '600 15px "SF Mono", monospace';
  ctx.fillText('PULL TO RELEASE', 728, 681);
  ctx.strokeStyle = 'rgba(255,255,255,0.25)';
  ctx.beginPath();
  ctx.arc(920, 674, 10, 0, Math.PI * 2);
  ctx.stroke();

  return canvasTexture(canvas);
}

function createLensTexture(seed = 1) {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(seed);

  ctx.clearRect(0, 0, 512, 512);

  const outer = ctx.createRadialGradient(256, 256, 20, 256, 256, 256);
  outer.addColorStop(0, '#010306');
  outer.addColorStop(0.3, '#081019');
  outer.addColorStop(0.56, '#101c2a');
  outer.addColorStop(0.72, '#213545');
  outer.addColorStop(0.84, '#090f15');
  outer.addColorStop(1, '#010203');
  ctx.fillStyle = outer;
  ctx.beginPath();
  ctx.arc(256, 256, 256, 0, Math.PI * 2);
  ctx.fill();

  // aperture blades
  ctx.save();
  ctx.translate(256, 256);
  const blades = 7;
  for (let i = 0; i < blades; i++) {
    ctx.save();
    ctx.rotate((i / blades) * Math.PI * 2 + 0.35);
    ctx.beginPath();
    ctx.moveTo(0, -30);
    ctx.lineTo(126, -94);
    ctx.lineTo(142, -34);
    ctx.lineTo(30, 0);
    ctx.closePath();
    ctx.fillStyle = i % 2 ? 'rgba(12, 21, 29, 0.5)' : 'rgba(4, 10, 15, 0.3)';
    ctx.fill();
    ctx.strokeStyle = 'rgba(123, 171, 185, 0.09)';
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();

  // inner element
  const inner = ctx.createRadialGradient(235, 238, 6, 256, 256, 132);
  inner.addColorStop(0, 'rgba(98, 53, 97, 0.7)');
  inner.addColorStop(0.26, 'rgba(28, 68, 76, 0.62)');
  inner.addColorStop(0.58, 'rgba(10, 27, 38, 0.96)');
  inner.addColorStop(0.82, 'rgba(5, 13, 20, 0.98)');
  inner.addColorStop(1, 'rgba(0, 2, 4, 1)');
  ctx.fillStyle = inner;
  ctx.beginPath();
  ctx.arc(256, 256, 142, 0, Math.PI * 2);
  ctx.fill();

  // sensor glow
  const sensor = ctx.createRadialGradient(240, 236, 0, 240, 236, 70);
  sensor.addColorStop(0, 'rgba(134, 196, 209, 0.12)');
  sensor.addColorStop(0.45, 'rgba(35, 87, 102, 0.16)');
  sensor.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = sensor;
  ctx.beginPath();
  ctx.arc(240, 236, 84, 0, Math.PI * 2);
  ctx.fill();

  // concentric rings
  for (const [radius, alpha, width] of [[150, 0.22, 2], [128, 0.1, 1.3], [106, 0.2, 1], [78, 0.08, 0.8], [42, 0.16, 0.6]]) {
    ctx.strokeStyle = `rgba(157, 211, 220, ${alpha})`;
    ctx.lineWidth = width;
    ctx.beginPath();
    ctx.arc(256, 256, radius, 0, Math.PI * 2);
    ctx.stroke();
  }

  // lens flares
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const flare = ctx.createRadialGradient(194, 190, 0, 194, 190, 74);
  flare.addColorStop(0, 'rgba(230, 255, 255, 0.66)');
  flare.addColorStop(0.14, 'rgba(120, 234, 255, 0.24)');
  flare.addColorStop(0.5, 'rgba(54, 121, 189, 0.08)');
  flare.addColorStop(1, 'rgba(0,0,0,0)');
  ctx.fillStyle = flare;
  ctx.fillRect(0, 0, 512, 512);
  ctx.restore();

  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  ctx.fillStyle = 'rgba(238, 220, 255, 0.38)';
  ctx.beginPath();
  ctx.ellipse(334, 344, 22, 8, -0.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = 'rgba(112, 77, 137, 0.22)';
  ctx.beginPath();
  ctx.arc(256, 256, 118, 0.4, 2.3);
  ctx.lineWidth = 3;
  ctx.strokeStyle = 'rgba(174, 130, 187, 0.13)';
  ctx.stroke();
  ctx.restore();

  // dust / micro specular
  for (let i = 0; i < 60; i++) {
    const a = rnd() * Math.PI * 2;
    const r = 150 + rnd() * 92;
    ctx.fillStyle = `rgba(210, 245, 249, ${0.02 + rnd() * 0.08})`;
    ctx.fillRect(256 + Math.cos(a) * r, 256 + Math.sin(a) * r, 1, 1);
  }

  return canvasTexture(canvas);
}

function createChipTexture(label, sub, tone = 'dark') {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');

  const dark = tone === 'dark';
  const base = ctx.createLinearGradient(0, 0, 512, 512);
  if (dark) {
    base.addColorStop(0, '#1d2228');
    base.addColorStop(0.5, '#0d1116');
    base.addColorStop(1, '#252d34');
  } else {
    base.addColorStop(0, '#a9b1b4');
    base.addColorStop(0.5, '#d4d9d9');
    base.addColorStop(1, '#929b9e');
  }
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 512, 512);

  ctx.save();
  ctx.globalAlpha = dark ? 0.18 : 0.2;
  for (let y = 0; y < 512; y += 3) {
    ctx.strokeStyle = y % 12 === 0 ? '#ffffff' : '#000000';
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(512, y);
    ctx.stroke();
  }
  ctx.restore();

  // die border
  ctx.strokeStyle = dark ? 'rgba(183, 196, 199, 0.18)' : 'rgba(30, 38, 41, 0.23)';
  ctx.lineWidth = 2;
  ctx.strokeRect(24, 24, 464, 464);
  ctx.strokeStyle = dark ? 'rgba(173, 187, 190, 0.1)' : 'rgba(30, 38, 41, 0.13)';
  ctx.strokeRect(41, 41, 430, 430);

  ctx.fillStyle = dark ? 'rgba(227, 232, 233, 0.83)' : 'rgba(32, 38, 41, 0.83)';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = '600 64px "SF Mono", "Helvetica Neue", monospace';
  ctx.fillText(label, 256, 230);
  ctx.font = '400 25px "SF Mono", monospace';
  ctx.fillStyle = dark ? 'rgba(196, 208, 210, 0.58)' : 'rgba(44, 52, 55, 0.55)';
  ctx.fillText(sub, 256, 292);
  ctx.font = '400 18px "SF Mono", monospace';
  ctx.fillText('APPLE 2026  ·  APL1W26', 256, 328);

  ctx.fillStyle = dark ? 'rgba(183, 198, 200, 0.25)' : 'rgba(38, 45, 48, 0.25)';
  for (let i = 0; i < 12; i++) {
    ctx.fillRect(62 + i * 32, 438, 18, 3);
  }

  return canvasTexture(canvas);
}

function createCameraPlateTexture() {
  const canvas = makeCanvas(1024, 280);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 280);
  ctx.textAlign = 'left';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = 'rgba(236, 249, 250, 0.77)';
  ctx.font = '500 27px "SF Pro Text", "SF Mono", sans-serif';
  ctx.fillText('48MP FUSION  ·  ƒ/1.6', 74, 104);
  ctx.fillStyle = 'rgba(184, 214, 217, 0.45)';
  ctx.font = '400 21px "SF Mono", monospace';
  ctx.fillText('26 MM  ·  SENSOR-SHIFT OIS  ·  2× TELE', 74, 150);
  ctx.fillStyle = 'rgba(177, 207, 211, 0.25)';
  ctx.font = '400 16px "SF Mono", monospace';
  ctx.fillText('DUO CAMERA SYSTEM / CALIBRATED', 74, 194);
  return canvasTexture(canvas);
}

function createLogoTexture() {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  const path = new Path2D('M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z');
  ctx.save();
  ctx.translate(64, 0);
  ctx.fillStyle = 'rgba(255,255,255,0.94)';
  ctx.fill(path);
  ctx.restore();
  const shine = ctx.createLinearGradient(0, 0, 512, 512);
  shine.addColorStop(0, 'rgba(255,255,255,0.32)');
  shine.addColorStop(0.4, 'rgba(255,255,255,0)');
  shine.addColorStop(1, 'rgba(0,0,0,0.14)');
  ctx.globalCompositeOperation = 'source-atop';
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 512, 512);
  return canvasTexture(canvas);
}

function createRegulatoryTexture() {
  const canvas = makeCanvas(1024, 230);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 230);
  ctx.fillStyle = 'rgba(218, 227, 228, 0.46)';
  ctx.textAlign = 'left';
  ctx.textBaseline = 'top';
  ctx.font = '400 19px "SF Mono", monospace';
  ctx.fillText('iPhone Duo  ·  Model A3288  ·  19.1Wh', 18, 22);
  ctx.fillText('Designed by Apple in California  ·  Assembled in China', 18, 54);
  ctx.fillText('CMIIT ID: 2026DJ8823  ·  Input 5–15V ⎓ 3A', 18, 86);
  ctx.fillText('IP68 6m/30min  ·  eSIM only  ·  Contains magnets', 18, 118);
  ctx.font = '400 16px "SF Mono", monospace';
  ctx.fillStyle = 'rgba(218, 227, 228, 0.3)';
  ctx.fillText('This device complies with part 15 of the FCC Rules.', 18, 160);

  ctx.strokeStyle = 'rgba(218, 227, 228, 0.32)';
  ctx.lineWidth = 2;
  ctx.strokeRect(820, 26, 70, 36);
  ctx.fillStyle = 'rgba(218, 227, 228, 0.34)';
  ctx.font = '500 15px "SF Mono", monospace';
  ctx.fillText('CE', 842, 45);
  ctx.strokeRect(906, 26, 38, 36);
  ctx.fillText('FCC', 914, 45);
  ctx.beginPath();
  ctx.arc(977, 45, 17, 0, Math.PI * 2);
  ctx.stroke();

  return canvasTexture(canvas);
}

function createFrostTexture() {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(256, 256);
  const rnd = seededRandom(4411);
  for (let i = 0; i < image.data.length; i += 4) {
    const v = 120 + Math.floor(rnd() * 94);
    image.data[i] = v;
    image.data[i + 1] = v;
    image.data[i + 2] = v;
    image.data[i + 3] = 255;
  }
  ctx.putImageData(image, 0, 0);
  return canvasTexture(canvas, { srgb: false, repeat: [2, 2] });
}

function createBrushedTexture(horizontal = true) {
  const canvas = makeCanvas(256, 256);
  const ctx = canvas.getContext('2d');
  const image = ctx.createImageData(256, 256);
  const rnd = seededRandom(1299);
  for (let y = 0; y < 256; y++) {
    let line = 0.5;
    for (let x = 0; x < 256; x++) {
      if (x % 5 === 0) line = rnd();
      const wave = horizontal ? y : x;
      const v = Math.floor(118 + line * 38 + Math.sin(wave * 0.7) * 10 + rnd() * 16);
      const idx = (y * 256 + x) * 4;
      image.data[idx] = v;
      image.data[idx + 1] = v;
      image.data[idx + 2] = v;
      image.data[idx + 3] = 255;
    }
  }
  ctx.putImageData(image, 0, 0);
  return canvasTexture(canvas, { srgb: false, repeat: [3, 8] });
}

function createVaporTexture() {
  const canvas = makeCanvas(1024, 512);
  const ctx = canvas.getContext('2d');
  const rnd = seededRandom(6671);

  const base = ctx.createLinearGradient(0, 0, 1024, 512);
  base.addColorStop(0, '#6f4028');
  base.addColorStop(0.28, '#b9794e');
  base.addColorStop(0.5, '#d39a68');
  base.addColorStop(0.72, '#9d603c');
  base.addColorStop(1, '#6b3e28');
  ctx.fillStyle = base;
  ctx.fillRect(0, 0, 1024, 512);

  // etched microchannels
  ctx.lineWidth = 2;
  for (let row = 0; row < 18; row++) {
    ctx.strokeStyle = row % 2 ? 'rgba(79, 43, 27, 0.27)' : 'rgba(255, 206, 162, 0.15)';
    ctx.beginPath();
    const y = 28 + row * 26;
    ctx.moveTo(24, y);
    for (let x = 24; x < 1000; x += 32) {
      ctx.quadraticCurveTo(x + 12, y + (rnd() - 0.5) * 18, x + 32, y);
    }
    ctx.stroke();
  }

  // branch manifold patterns
  ctx.strokeStyle = 'rgba(70, 39, 24, 0.26)';
  ctx.lineWidth = 5;
  for (let i = 0; i < 7; i++) {
    ctx.beginPath();
    ctx.moveTo(70 + i * 130, 8);
    ctx.bezierCurveTo(100 + i * 130, 160, 40 + i * 130, 300, 75 + i * 130, 504);
    ctx.stroke();
  }

  ctx.fillStyle = 'rgba(82, 45, 27, 0.3)';
  ctx.font = '500 19px "SF Mono", monospace';
  ctx.fillText('VAPOR CHAMBER / 3D VC', 40, 470);
  ctx.fillText('Cu 99.9%  ·  0.35mm', 40, 496);
  ctx.fillStyle = 'rgba(255, 214, 173, 0.16)';
  ctx.font = '400 15px "SF Mono", monospace';
  ctx.fillText('DUO THERMAL SYSTEM', 740, 470);

  // subtle highlights
  ctx.save();
  ctx.globalCompositeOperation = 'screen';
  const shine = ctx.createLinearGradient(0, 0, 0, 512);
  shine.addColorStop(0, 'rgba(255, 232, 192, 0.14)');
  shine.addColorStop(0.5, 'rgba(255, 232, 192, 0)');
  shine.addColorStop(1, 'rgba(68, 30, 18, 0.18)');
  ctx.fillStyle = shine;
  ctx.fillRect(0, 0, 1024, 512);
  ctx.restore();

  return canvasTexture(canvas);
}

function createShadowTexture() {
  const canvas = makeCanvas(512, 512);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 512, 512);
  const g = ctx.createRadialGradient(256, 256, 20, 256, 256, 250);
  g.addColorStop(0, 'rgba(0, 0, 0, 0.72)');
  g.addColorStop(0.44, 'rgba(0, 0, 0, 0.36)');
  g.addColorStop(0.72, 'rgba(0, 0, 0, 0.1)');
  g.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 512, 512);
  return canvasTexture(canvas, { srgb: false });
}

function createParticleTexture() {
  const canvas = makeCanvas(64, 64);
  const ctx = canvas.getContext('2d');
  const g = ctx.createRadialGradient(32, 32, 0, 32, 32, 32);
  g.addColorStop(0, 'rgba(200, 255, 250, 0.9)');
  g.addColorStop(0.28, 'rgba(140, 245, 235, 0.4)');
  g.addColorStop(1, 'rgba(120, 230, 230, 0)');
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 64, 64);
  return canvasTexture(canvas, { srgb: false });
}

// ------------------------------------------------------------
// Geometry helpers
// ------------------------------------------------------------

function roundedRectShape(w, h, r) {
  const s = new THREE.Shape();
  const x = -w / 2;
  const y = -h / 2;
  const radius = Math.min(r, w / 2, h / 2);
  s.moveTo(x + radius, y);
  s.lineTo(x + w - radius, y);
  s.quadraticCurveTo(x + w, y, x + w, y + radius);
  s.lineTo(x + w, y + h - radius);
  s.quadraticCurveTo(x + w, y + h, x + w - radius, y + h);
  s.lineTo(x + radius, y + h);
  s.quadraticCurveTo(x, y + h, x, y + h - radius);
  s.lineTo(x, y + radius);
  s.quadraticCurveTo(x, y, x + radius, y);
  s.closePath();
  return s;
}

function halfRectShape(w, h, r, side = 1) {
  const s = new THREE.Shape();
  const radius = Math.min(r, w / 2, h / 2);
  if (side > 0) {
    s.moveTo(-w / 2, h / 2);
    s.lineTo(w / 2 - radius, h / 2);
    s.quadraticCurveTo(w / 2, h / 2, w / 2, h / 2 - radius);
    s.lineTo(w / 2, -h / 2 + radius);
    s.quadraticCurveTo(w / 2, -h / 2, w / 2 - radius, -h / 2);
    s.lineTo(-w / 2, -h / 2);
    s.closePath();
  } else {
    s.moveTo(w / 2, h / 2);
    s.lineTo(-w / 2 + radius, h / 2);
    s.quadraticCurveTo(-w / 2, h / 2, -w / 2, h / 2 - radius);
    s.lineTo(-w / 2, -h / 2 + radius);
    s.quadraticCurveTo(-w / 2, -h / 2, -w / 2 + radius, -h / 2);
    s.lineTo(w / 2, -h / 2);
    s.closePath();
  }
  return s;
}

function extrudeShape(shape, depth, { bevel = 0.012, curveSegments = 16, materials = null } = {}) {
  const geometry = new THREE.ExtrudeGeometry(shape, {
    depth,
    steps: 1,
    bevelEnabled: bevel > 0,
    bevelSegments: 2,
    bevelSize: bevel,
    bevelThickness: bevel,
    curveSegments
  });
  geometry.translate(0, 0, -depth / 2);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, materials);
}

function texturedShapeMesh(shape, texture, { color = 0xffffff, roughness = 0.5, metalness = 0.05, emissive = 0x000000, emissiveIntensity = 0, toneMapped = true, side = THREE.FrontSide, transparent = false, opacity = 1 } = {}) {
  const geometry = new THREE.ShapeGeometry(shape, 32);
  const position = geometry.attributes.position;
  const uv = geometry.attributes.uv;
  geometry.computeBoundingBox();
  const box = geometry.boundingBox;
  const sizeX = box.max.x - box.min.x || 1;
  const sizeY = box.max.y - box.min.y || 1;
  for (let i = 0; i < position.count; i++) {
    uv.setXY(i, (position.getX(i) - box.min.x) / sizeX, (position.getY(i) - box.min.y) / sizeY);
  }
  uv.needsUpdate = true;
  const material = new THREE.MeshStandardMaterial({
    map: texture,
    color,
    roughness,
    metalness,
    emissive,
    emissiveMap: emissiveIntensity > 0 ? texture : null,
    emissiveIntensity,
    side,
    transparent,
    opacity,
    toneMapped
  });
  return new THREE.Mesh(geometry, material);
}

function makeRoundedBox(w, h, d, radius, material) {
  const geometry = new RoundedBoxGeometry(w, h, d, 4, Math.min(radius, w / 2, h / 2, d / 2) * 0.98);
  return new THREE.Mesh(geometry, material);
}

function metalMaterial(color, { roughness = 0.3, metalness = 1, clearcoat = 0.35, envMapIntensity = 1.05 } = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness,
    roughness,
    clearcoat,
    clearcoatRoughness: 0.22,
    envMapIntensity
  });
}

function glassMaterial(color, opacity = 0.2, extra = {}) {
  return new THREE.MeshPhysicalMaterial({
    color,
    metalness: 0.15,
    roughness: 0.06,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    transparent: true,
    opacity,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.4,
    ...extra
  });
}

function lineMaterial(color, opacity = 0.55, depthTest = true) {
  return new THREE.LineBasicMaterial({
    color,
    transparent: true,
    opacity,
    depthTest,
    depthWrite: false,
    blending: THREE.AdditiveBlending
  });
}

function segment(points, material) {
  const geometry = new THREE.BufferGeometry().setFromPoints(points);
  return new THREE.LineSegments(geometry, material);
}

function cylinderBetween(a, b, radius, material, radialSegments = 8) {
  const direction = new THREE.Vector3().subVectors(b, a);
  const length = direction.length();
  const geometry = new THREE.CylinderGeometry(radius, radius, length, radialSegments);
  const mesh = new THREE.Mesh(geometry, material);
  mesh.position.copy(a).add(b).multiplyScalar(0.5);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), direction.normalize());
  return mesh;
}

function starShape(points, outer, inner, rotation = 0) {
  const shape = new THREE.Shape();
  for (let i = 0; i < points * 2; i++) {
    const radius = i % 2 === 0 ? outer : inner;
    const angle = rotation + (i / (points * 2)) * Math.PI * 2;
    const x = Math.cos(angle) * radius;
    const y = Math.sin(angle) * radius;
    if (i === 0) shape.moveTo(x, y);
    else shape.lineTo(x, y);
  }
  shape.closePath();
  return shape;
}

function plusShape(size, arm) {
  const s = new THREE.Shape();
  s.moveTo(-arm, -size);
  s.lineTo(arm, -size);
  s.lineTo(arm, -arm);
  s.lineTo(size, -arm);
  s.lineTo(size, arm);
  s.lineTo(arm, arm);
  s.lineTo(arm, size);
  s.lineTo(-arm, size);
  s.lineTo(-arm, arm);
  s.lineTo(-size, arm);
  s.lineTo(-size, -arm);
  s.lineTo(-arm, -arm);
  s.closePath();
  return s;
}

function makeRibbon(curve, width, material, segments = 64, up = new THREE.Vector3(0, 1, 0)) {
  const positions = [];
  const uvs = [];
  const indices = [];
  up = up.clone().normalize();
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const point = curve.getPointAt(t);
    const tangent = curve.getTangentAt(t).normalize();
    const side = new THREE.Vector3().crossVectors(tangent, up).normalize().multiplyScalar(width / 2);
    const a = point.clone().add(side);
    const b = point.clone().sub(side);
    positions.push(a.x, a.y, a.z, b.x, b.y, b.z);
    uvs.push(0, t, 1, t);
    if (i < segments) {
      const base = i * 2;
      indices.push(base, base + 1, base + 2, base + 1, base + 3, base + 2);
    }
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return new THREE.Mesh(geometry, material);
}

// ------------------------------------------------------------
// Renderer, scene and lighting
// ------------------------------------------------------------

const MAT = {};
const TEX = {};
const floorSprites = [];
const screwRecords = [];
let floorDisc;
let selectionSprite = null;
let stageReadoutTimer = 0;
let gizmoTick = 0;
let lastPercent = -1;
let lastModeText = '';
let modalReturnFocus = null;
const readoutPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);
const readoutPoint = new THREE.Vector3();
const projectVector = new THREE.Vector3();
const labelCandidates = [];
const placedLabelRects = [];
const tempColor = new THREE.Color();

function createRenderer() {
  const mount = $('#webglMount');
  renderer = new THREE.WebGLRenderer({
    antialias: true,
    alpha: true,
    powerPreference: 'high-performance'
  });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
  renderer.setClearColor(0x000000, 0);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.08;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.domElement.id = 'duoCanvas';
  renderer.domElement.setAttribute('role', 'img');
  renderer.domElement.setAttribute('aria-label', 'iPhone Duo 三维拆解模型。拖动旋转，滚轮或双指缩放，点击部件查看详情。');
  mount.appendChild(renderer.domElement);
}

function createScene() {
  scene = new THREE.Scene();
  scene.fog = new THREE.Fog(0x03080c, 42, 92);

  camera = new THREE.PerspectiveCamera(38, window.innerWidth / window.innerHeight, 0.08, 160);
  camera.position.set(9.5, 6.5, 29);

  controls = new OrbitControls(camera, renderer.domElement);
  controls.target.set(0, 0.15, 0);
  controls.enableDamping = true;
  controls.dampingFactor = 0.055;
  controls.rotateSpeed = 0.62;
  controls.zoomSpeed = 0.82;
  controls.panSpeed = 0.6;
  controls.minDistance = 3.4;
  controls.maxDistance = 74;
  controls.minPolarAngle = 0.09;
  controls.maxPolarAngle = Math.PI - 0.09;
  controls.autoRotate = true;
  controls.autoRotateSpeed = 0.42;
  controls.zoomToCursor = true;
  controls.screenSpacePanning = true;
  controls.touches.ONE = THREE.TOUCH.ROTATE;
  controls.touches.TWO = THREE.TOUCH.DOLLY_PAN;
}

function createEnvironment() {
  const canvas = createEnvironmentTexture();
  const equirect = new THREE.CanvasTexture(canvas);
  equirect.mapping = THREE.EquirectangularReflectionMapping;
  equirect.colorSpace = THREE.SRGBColorSpace;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  envMap = pmrem.fromEquirectangular(equirect).texture;
  scene.environment = envMap;
  scene.environmentIntensity = 0.92;
  equirect.dispose();
  pmrem.dispose();
}

function createLights() {
  const hemi = new THREE.HemisphereLight(0x9bdcff, 0x030608, 0.5);
  scene.add(hemi);

  const ambient = new THREE.AmbientLight(0x6f9ea8, 0.16);
  scene.add(ambient);

  const key = new THREE.DirectionalLight(0xe8ffff, 2.35);
  key.position.set(9, 13.5, 17);
  key.castShadow = true;
  key.shadow.mapSize.set(2048, 2048);
  key.shadow.camera.left = -15;
  key.shadow.camera.right = 15;
  key.shadow.camera.top = 12;
  key.shadow.camera.bottom = -12;
  key.shadow.camera.near = 1;
  key.shadow.camera.far = 55;
  key.shadow.bias = -0.00045;
  key.shadow.normalBias = 0.028;
  key.shadow.radius = 2.4;
  key.target.position.set(0, 0, 0);
  scene.add(key);
  scene.add(key.target);

  const rim = new THREE.DirectionalLight(0x5d8cff, 1.3);
  rim.position.set(-15, 7, -13);
  scene.add(rim);

  const warm = new THREE.DirectionalLight(0xffb87a, 0.55);
  warm.position.set(-5, 2.5, -16);
  scene.add(warm);

  const topFill = new THREE.DirectionalLight(0xb8f7ff, 0.55);
  topFill.position.set(0, -9, 12);
  scene.add(topFill);

  const tealPoint = new THREE.PointLight(0x7af7df, 110, 38, 2);
  tealPoint.position.set(0, -2.4, 10);
  scene.add(tealPoint);

  const bluePoint = new THREE.PointLight(0x396bff, 120, 45, 2);
  bluePoint.position.set(0, -4.5, -12);
  scene.add(bluePoint);
}

function createFloor() {
  const canvas = makeCanvas(1024, 1024);
  const ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, 1024, 1024);
  const glow = ctx.createRadialGradient(512, 512, 0, 512, 512, 512);
  glow.addColorStop(0, 'rgba(18, 50, 57, 0.5)');
  glow.addColorStop(0.34, 'rgba(10, 32, 39, 0.28)');
  glow.addColorStop(0.7, 'rgba(4, 14, 19, 0.09)');
  glow.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = glow;
  ctx.fillRect(0, 0, 1024, 1024);

  ctx.save();
  ctx.translate(512, 512);
  ctx.strokeStyle = 'rgba(122, 247, 223, 0.13)';
  ctx.lineWidth = 1;
  [150, 256, 356, 442].forEach((radius, index) => {
    ctx.beginPath();
    ctx.arc(0, 0, radius, 0, Math.PI * 2);
    ctx.strokeStyle = `rgba(122, 247, 223, ${0.12 - index * 0.018})`;
    ctx.stroke();
  });
  ctx.setLineDash([3, 16]);
  ctx.strokeStyle = 'rgba(122, 247, 223, 0.12)';
  for (let i = 0; i < 24; i++) {
    const angle = (i / 24) * Math.PI * 2;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle) * 170, Math.sin(angle) * 170);
    ctx.lineTo(Math.cos(angle) * 450, Math.sin(angle) * 450);
    ctx.stroke();
  }
  ctx.setLineDash([]);
  ctx.strokeStyle = 'rgba(200, 255, 250, 0.2)';
  ctx.beginPath();
  ctx.moveTo(-8, 0);
  ctx.lineTo(8, 0);
  ctx.moveTo(0, -8);
  ctx.lineTo(0, 8);
  ctx.stroke();
  ctx.restore();

  const texture = canvasTexture(canvas);
  floorDisc = new THREE.Mesh(
    new THREE.CircleGeometry(25, 96),
    new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0.9,
      depthWrite: false,
      toneMapped: false
    })
  );
  floorDisc.rotation.x = -Math.PI / 2;
  floorDisc.position.y = -7.82;
  floorDisc.renderOrder = -1;
  scene.add(floorDisc);

  const shadowPlane = new THREE.Mesh(
    new THREE.PlaneGeometry(36, 28),
    new THREE.ShadowMaterial({ color: 0x000000, opacity: 0.42, transparent: true, depthWrite: false })
  );
  shadowPlane.rotation.x = -Math.PI / 2;
  shadowPlane.position.y = -7.795;
  shadowPlane.receiveShadow = true;
  scene.add(shadowPlane);

  const ringMaterial = lineMaterial(0x7af7df, 0.085);
  const ringPoints = [];
  const radii = [4.4, 8.8, 13.4, 18.2, 23];
  for (const radius of radii) {
    for (let i = 0; i < 120; i++) {
      const a = (i / 120) * Math.PI * 2;
      const b = ((i + 1) / 120) * Math.PI * 2;
      ringPoints.push(
        new THREE.Vector3(Math.cos(a) * radius, -7.77, Math.sin(a) * radius),
        new THREE.Vector3(Math.cos(b) * radius, -7.77, Math.sin(b) * radius)
      );
    }
  }
  const floorGrid = segment(ringPoints, ringMaterial);
  scene.add(floorGrid);
}

function createParticles() {
  const count = 620;
  const positions = new Float32Array(count * 3);
  const random = seededRandom(7717);
  for (let i = 0; i < count; i++) {
    const radius = 5 + Math.pow(random(), 0.62) * 25;
    const angle = random() * Math.PI * 2;
    positions[i * 3] = Math.cos(angle) * radius;
    positions[i * 3 + 1] = -5.6 + random() * 19;
    positions[i * 3 + 2] = Math.sin(angle) * radius;
  }
  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const material = new THREE.PointsMaterial({
    color: 0x9ff7ea,
    map: TEX.particle || null,
    size: 0.088,
    sizeAttenuation: true,
    transparent: true,
    opacity: 0.55,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  particleSystem = new THREE.Points(geometry, material);
  particleSystem.renderOrder = -1;
  scene.add(particleSystem);
}

// ------------------------------------------------------------
// Materials
// ------------------------------------------------------------

function createMaterials() {
  TEX.screen = createScreenTexture();
  TEX.outerScreen = createOuterScreenTexture();
  TEX.pcb = createPcbTexture();
  TEX.battery1 = createBatteryTexture(1);
  TEX.battery2 = createBatteryTexture(2);
  TEX.lensA = createLensTexture(37);
  TEX.lensB = createLensTexture(83);
  TEX.lensC = createLensTexture(129);
  TEX.chipA20 = createChipTexture('A20 PRO', '2 NM · 6C CPU / 7C GPU', 'dark');
  TEX.chipC2 = createChipTexture('C2', '5G MODEM · DUAL SIM', 'dark');
  TEX.chipN1 = createChipTexture('N1', 'WI-FI 7 · BT 6', 'dark');
  TEX.chipNand = createChipTexture('NAND', '1 TB NVME', 'silver');
  TEX.chipPmic = createChipTexture('PMIC', 'POWER MANAGEMENT', 'dark');
  TEX.chipRf = createChipTexture('RF', 'mmWAVE FRONT END', 'silver');
  TEX.cameraPlate = createCameraPlateTexture();
  TEX.logo = createLogoTexture();
  TEX.regulatory = createRegulatoryTexture();
  TEX.frost = createFrostTexture();
  TEX.brushedH = createBrushedTexture(true);
  TEX.brushedV = createBrushedTexture(false);
  TEX.vapor = createVaporTexture();
  TEX.shadow = createShadowTexture();
  TEX.particle = createParticleTexture();

  MAT.frame = new THREE.MeshPhysicalMaterial({
    color: 0x575b5d,
    metalness: 1,
    roughness: 0.34,
    clearcoat: 0.38,
    clearcoatRoughness: 0.24,
    envMapIntensity: 1.18,
    roughnessMap: TEX.brushedH
  });
  MAT.frame.userData.themeRole = 'frame';

  MAT.frameSide = new THREE.MeshPhysicalMaterial({
    color: 0x33383a,
    metalness: 1,
    roughness: 0.44,
    clearcoat: 0.24,
    envMapIntensity: 0.9
  });
  MAT.frameSide.userData.themeRole = 'frameSide';

  MAT.buttons = new THREE.MeshPhysicalMaterial({
    color: 0x494d4f,
    metalness: 1,
    roughness: 0.31,
    clearcoat: 0.4,
    clearcoatRoughness: 0.2,
    envMapIntensity: 1.1
  });
  MAT.buttons.userData.themeRole = 'buttons';

  MAT.hinge = new THREE.MeshPhysicalMaterial({
    color: 0x686b69,
    metalness: 1,
    roughness: 0.42,
    clearcoat: 0.25,
    envMapIntensity: 0.9
  });
  MAT.hinge.userData.themeRole = 'hinge';

  MAT.hingeDark = new THREE.MeshStandardMaterial({
    color: 0x191d1e,
    metalness: 0.82,
    roughness: 0.38
  });

  MAT.plateau = new THREE.MeshPhysicalMaterial({
    color: 0x272d2f,
    metalness: 0.9,
    roughness: 0.28,
    clearcoat: 0.7,
    clearcoatRoughness: 0.16,
    envMapIntensity: 1.2
  });
  MAT.plateau.userData.themeRole = 'plateau';

  MAT.backGlass = new THREE.MeshPhysicalMaterial({
    color: 0x1b2327,
    metalness: 0.15,
    roughness: 0.48,
    roughnessMap: TEX.frost,
    clearcoat: 0.48,
    clearcoatRoughness: 0.52,
    envMapIntensity: 0.95
  });
  MAT.backGlass.userData.themeRole = 'backGlass';

  MAT.backGlassInner = new THREE.MeshStandardMaterial({
    color: 0x11181b,
    metalness: 0.25,
    roughness: 0.66
  });

  MAT.logo = new THREE.MeshBasicMaterial({
    map: TEX.logo,
    color: 0xc8d3d4,
    transparent: true,
    opacity: 0.58,
    depthWrite: false,
    toneMapped: true
  });
  MAT.logo.userData.themeRole = 'logo';
  MAT.logo.userData.xraySkip = true;

  MAT.regulatory = new THREE.MeshBasicMaterial({
    map: TEX.regulatory,
    color: 0xaab9ba,
    transparent: true,
    opacity: 0.42,
    depthWrite: false,
    toneMapped: true
  });
  MAT.regulatory.userData.xraySkip = true;

  MAT.screen = new THREE.MeshStandardMaterial({
    map: TEX.screen,
    emissiveMap: TEX.screen,
    emissive: 0xffffff,
    emissiveIntensity: 0.88,
    color: 0xdfe9e8,
    roughness: 0.2,
    metalness: 0.02,
    toneMapped: true
  });

  MAT.outerScreen = new THREE.MeshStandardMaterial({
    map: TEX.outerScreen,
    emissiveMap: TEX.outerScreen,
    emissive: 0xffffff,
    emissiveIntensity: 0.76,
    color: 0xd9e4e3,
    roughness: 0.18,
    metalness: 0.02,
    toneMapped: true
  });

  MAT.screenGlass = new THREE.MeshPhysicalMaterial({
    color: 0xbadfe4,
    metalness: 0.08,
    roughness: 0.035,
    clearcoat: 1,
    clearcoatRoughness: 0.03,
    transparent: true,
    opacity: 0.11,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.8
  });

  MAT.coverGlass = new THREE.MeshPhysicalMaterial({
    color: 0xc6eef1,
    metalness: 0.12,
    roughness: 0.09,
    clearcoat: 1,
    clearcoatRoughness: 0.05,
    transparent: true,
    opacity: 0.13,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.6
  });

  MAT.displayPlate = new THREE.MeshStandardMaterial({
    color: 0x0d1316,
    metalness: 0.6,
    roughness: 0.4
  });

  MAT.titaniumPlate = new THREE.MeshPhysicalMaterial({
    color: 0x5b5e5d,
    metalness: 1,
    roughness: 0.36,
    clearcoat: 0.3,
    envMapIntensity: 1.05
  });

  MAT.graphite = new THREE.MeshStandardMaterial({
    color: 0x14191b,
    metalness: 0.32,
    roughness: 0.72
  });

  MAT.board = new THREE.MeshStandardMaterial({
    map: TEX.pcb,
    color: 0x8da694,
    metalness: 0.14,
    roughness: 0.62
  });

  MAT.boardSide = new THREE.MeshStandardMaterial({
    color: 0x1a2821,
    metalness: 0.2,
    roughness: 0.7
  });

  MAT.chip = new THREE.MeshStandardMaterial({
    color: 0x0c1014,
    metalness: 0.52,
    roughness: 0.34
  });

  MAT.chipLight = new THREE.MeshStandardMaterial({
    color: 0x737c7e,
    metalness: 0.75,
    roughness: 0.36
  });

  MAT.shield = new THREE.MeshPhysicalMaterial({
    color: 0x9ca5a4,
    metalness: 0.95,
    roughness: 0.36,
    clearcoat: 0.2,
    envMapIntensity: 1.1
  });

  MAT.gold = new THREE.MeshStandardMaterial({
    color: 0xc99a4f,
    metalness: 1,
    roughness: 0.28
  });

  MAT.copper = new THREE.MeshStandardMaterial({
    color: 0xb87445,
    metalness: 0.95,
    roughness: 0.34
  });

  MAT.vapor = new THREE.MeshStandardMaterial({
    map: TEX.vapor,
    color: 0xffffff,
    metalness: 0.82,
    roughness: 0.36,
    emissive: 0x271006,
    emissiveIntensity: 0.22
  });

  MAT.battery = new THREE.MeshStandardMaterial({
    map: TEX.battery1,
    color: 0xc7cfcc,
    metalness: 0.24,
    roughness: 0.58
  });

  MAT.battery2 = new THREE.MeshStandardMaterial({
    map: TEX.battery2,
    color: 0xc7cfcc,
    metalness: 0.24,
    roughness: 0.58
  });

  MAT.batteryEdge = new THREE.MeshStandardMaterial({
    color: 0x131719,
    metalness: 0.44,
    roughness: 0.6
  });

  MAT.polyimide = new THREE.MeshStandardMaterial({
    color: 0xb8742d,
    metalness: 0.35,
    roughness: 0.34,
    emissive: 0x351703,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide
  });

  MAT.black = new THREE.MeshStandardMaterial({
    color: 0x070a0c,
    metalness: 0.25,
    roughness: 0.5
  });

  MAT.rubber = new THREE.MeshStandardMaterial({
    color: 0x111516,
    metalness: 0.05,
    roughness: 0.9
  });

  MAT.metal = new THREE.MeshPhysicalMaterial({
    color: 0xb8c1c1,
    metalness: 1,
    roughness: 0.22,
    clearcoat: 0.4,
    envMapIntensity: 1.25
  });

  MAT.sapphire = new THREE.MeshPhysicalMaterial({
    color: 0x0b1118,
    metalness: 0.25,
    roughness: 0.04,
    clearcoat: 1,
    clearcoatRoughness: 0.02,
    transparent: true,
    opacity: 0.86,
    envMapIntensity: 2,
    side: THREE.DoubleSide
  });

  MAT.lens = new THREE.MeshStandardMaterial({
    map: TEX.lensA,
    color: 0xffffff,
    metalness: 0.42,
    roughness: 0.12,
    emissive: 0x0a1a24,
    emissiveIntensity: 0.3,
    side: THREE.DoubleSide
  });

  MAT.flash = new THREE.MeshStandardMaterial({
    color: 0xfff3d5,
    metalness: 0.08,
    roughness: 0.26,
    emissive: 0xffc37a,
    emissiveIntensity: 0.75
  });

  MAT.magnet = new THREE.MeshStandardMaterial({
    color: 0x2f3436,
    metalness: 0.9,
    roughness: 0.42
  });

  MAT.antenna = new THREE.MeshStandardMaterial({
    color: 0x1d2528,
    metalness: 0.6,
    roughness: 0.5
  });

  MAT.screwSteel = metalMaterial(0xb2b7b6, { roughness: 0.25 });
  MAT.screwDark = metalMaterial(0x4b5051, { roughness: 0.32 });
  MAT.screwBlack = new THREE.MeshStandardMaterial({
    color: 0x15191b,
    metalness: 0.7,
    roughness: 0.42
  });

  MAT.screenHole = new THREE.MeshBasicMaterial({
    color: 0x010305,
    toneMapped: false
  });
}

// ------------------------------------------------------------
// Theme, x-ray and registration
// ------------------------------------------------------------

const THEMES = {
  night: {
    label: 'NIGHT SKY',
    frame: 0x575b5d,
    frameSide: 0x33383a,
    backGlass: 0x1b2327,
    buttons: 0x494d4f,
    hinge: 0x686b69,
    plateau: 0x272d2f,
    logo: 0xc8d3d4
  },
  star: {
    label: 'STAR WHITE',
    frame: 0xd7d2c8,
    frameSide: 0xa8a299,
    backGlass: 0xe7e2d9,
    buttons: 0xcec8bd,
    hinge: 0xbfbab1,
    plateau: 0xf1ede4,
    logo: 0x34383a
  }
};

function applyTheme(theme) {
  const resolved = THEMES[theme] ? theme : 'night';
  state.theme = resolved;
  const palette = THEMES[resolved];
  for (const [role, materials] of Object.entries(themeMaterials)) {
    const value = palette[role];
    if (typeof value !== 'number') continue;
    for (const material of materials) {
      if (material && material.color) {
        material.color.setHex(value);
        material.needsUpdate = true;
      }
    }
  }
  document.body.dataset.theme = resolved;
  const label = $('.theme-toggle__label');
  if (label) label.textContent = palette.label;
  if (floorDisc && floorDisc.material) {
    floorDisc.material.opacity = resolved === 'star' ? 0.75 : 0.9;
  }
}

function toggleTheme() {
  const next = state.theme === 'night' ? 'star' : 'night';
  applyTheme(next);
  toast(next === 'star' ? '机身配色：星空白 · 磨砂玻璃与浅色钛金属' : '机身配色：夜空黑 · 深色钛金属与磨砂玻璃');
}

function toggleXray(force) {
  const next = typeof force === 'boolean' ? force : !state.xray;
  state.xray = next;
  const seen = new Set();
  for (const id of shellPartIds) {
    const part = parts.get(id);
    if (!part) continue;
    for (const material of part.mats) {
      if (!material || seen.has(material) || material.userData.xraySkip) continue;
      seen.add(material);
      if (!material.userData.xrayBase) {
        material.userData.xrayBase = {
          transparent: material.transparent,
          opacity: material.opacity,
          depthWrite: material.depthWrite,
          emissiveIntensity: typeof material.emissiveIntensity === 'number' ? material.emissiveIntensity : null
        };
      }
      const base = material.userData.xrayBase;
      if (next) {
        const isScreen = Boolean(material.emissiveMap);
        material.transparent = true;
        material.depthWrite = false;
        material.opacity = isScreen ? 0.13 : (material.map ? 0.16 : 0.19);
        if (typeof material.emissiveIntensity === 'number') material.emissiveIntensity = Math.min(base.emissiveIntensity, 0.22);
      } else {
        material.transparent = base.transparent;
        material.depthWrite = base.depthWrite;
        material.opacity = base.opacity;
        if (base.emissiveIntensity !== null) material.emissiveIntensity = base.emissiveIntensity;
      }
      material.needsUpdate = true;
    }
  }
  $('#xrayBtn')?.classList.toggle('is-active', next);
  $('#xrayBtn')?.setAttribute('aria-pressed', String(next));
  updateRenderModeLabel();
  announce(next ? '透视模式开启，可以观察内部主板与电池。' : '透视模式关闭。');
  if (!next && state.selectedId) applySelectionMaterials(state.selectedId);
}

function registerPart(id, group) {
  const data = PART_DATA.find((item) => item.id === id);
  if (!data) {
    console.warn('Unknown part id', id);
    return null;
  }

  const materialClones = new Map();
  const mats = new Set();
  const meshes = [];

  const cloneMaterial = (material) => {
    if (!material) return material;
    if (materialClones.has(material)) return materialClones.get(material);
    const clone = material.clone();
    clone.userData = { ...material.userData };
    if (typeof clone.emissiveIntensity === 'number') {
      clone.emissiveIntensity = material.emissiveIntensity;
    }
    if (clone.emissive && typeof clone.emissive.getHex === 'function') {
      const baseEmissive = clone.emissive.getHex();
      const baseIntensity = typeof clone.emissiveIntensity === 'number' ? clone.emissiveIntensity : 0;
      clone.userData.baseEmissive = baseEmissive;
      clone.userData.baseEmissiveIntensity = baseIntensity;
    }
    clone.needsUpdate = true;
    materialClones.set(material, clone);
    mats.add(clone);
    const role = clone.userData.themeRole;
    if (role && themeMaterials[role]) themeMaterials[role].push(clone);
    return clone;
  };

  group.traverse((object) => {
    if (object.isMesh || object.isLine || object.isPoints) {
      if (object.material) {
        object.material = Array.isArray(object.material)
          ? object.material.map(cloneMaterial)
          : cloneMaterial(object.material);
      }
      object.userData.partId = id;
      if (object.isMesh) {
        const firstMaterial = Array.isArray(object.material) ? object.material[0] : object.material;
        const transparent = firstMaterial && firstMaterial.transparent;
        object.castShadow = !object.userData.noShadow && !transparent && id !== 'screws';
        object.receiveShadow = !object.userData.noShadow;
        if (!object.userData.skipPick) pickables.push(object);
        meshes.push(object);
      }
    }
    object.userData.partId = object.userData.partId || id;
  });

  device.add(group);
  const explodeDir = new THREE.Vector3(...data.explode);
  if (explodeDir.lengthSq() < 0.0001) explodeDir.set(0, 0, 1);
  explodeDir.normalize();
  const entry = {
    id,
    data,
    group,
    base: group.position.clone(),
    mats: Array.from(mats),
    meshes,
    progress: 0,
    explodeDir,
    explodeLen: Math.hypot(...data.explode),
    lift: 0,
    targetLift: 0
  };
  parts.set(id, entry);
  return entry;
}

// ------------------------------------------------------------
// Selection treatment
// ------------------------------------------------------------

function clearSelectionMaterials() {
  for (const material of selection.materials) {
    if (!material) continue;
    if (material.emissive && typeof material.userData.baseEmissive === 'number') {
      material.emissive.setHex(material.userData.baseEmissive);
    }
    if (typeof material.userData.baseEmissiveIntensity === 'number') {
      material.emissiveIntensity = material.userData.baseEmissiveIntensity;
    }
  }
  selection.materials = [];

  for (const item of selection.outlines) {
    if (item.line.parent) item.line.parent.remove(item.line);
    item.line.geometry.dispose();
    item.line.material.dispose();
  }
  selection.outlines = [];
  selection.partId = null;
}

function applySelectionMaterials(id) {
  clearSelectionMaterials();
  const part = parts.get(id);
  if (!part) return;
  const colorHex = CATEGORIES[part.data.category].color;
  selection.partId = id;

  for (const material of part.mats) {
    if (!material || !material.emissive || material.emissiveMap) continue;
    if (typeof material.userData.baseEmissive !== 'number') continue;
    material.emissive.set(colorHex);
    material.emissiveIntensity = Math.max(0.52, material.userData.baseEmissiveIntensity || 0);
    selection.materials.push(material);
  }

  const candidates = part.meshes
    .filter((mesh) => {
      if (!mesh.geometry) return false;
      mesh.geometry.computeBoundingSphere();
      return mesh.geometry.boundingSphere && mesh.geometry.boundingSphere.radius > 0.16;
    })
    .sort((a, b) => b.geometry.boundingSphere.radius - a.geometry.boundingSphere.radius)
    .slice(0, 24);

  for (const mesh of candidates) {
    let edges;
    try {
      edges = new THREE.EdgesGeometry(mesh.geometry, 32);
    } catch (error) {
      continue;
    }
    if (!edges.attributes.position || edges.attributes.position.count === 0) {
      edges.dispose();
      continue;
    }
    const material = new THREE.LineBasicMaterial({
      color: new THREE.Color(colorHex),
      transparent: true,
      opacity: 0.62,
      depthTest: false,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
      toneMapped: false
    });
    const line = new THREE.LineSegments(edges, material);
    line.renderOrder = 9;
    mesh.add(line);
    selection.outlines.push({ line });
  }

  if (selectionSprite) {
    selectionSprite.visible = true;
    selectionSprite.material.color.set(colorHex);
  }
}

function buildSelectionSprite() {
  const material = new THREE.SpriteMaterial({
    map: TEX.particle,
    color: 0x7af7df,
    transparent: true,
    opacity: 0.75,
    depthTest: false,
    depthWrite: false,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  selectionSprite = new THREE.Sprite(material);
  selectionSprite.scale.set(1.3, 1.3, 1);
  selectionSprite.visible = false;
  selectionSprite.renderOrder = 8;
  device.add(selectionSprite);
}

function updateSelectionSprite(elapsed) {
  if (!selectionSprite || !selectionSprite.visible || !state.selectedId) return;
  const part = parts.get(state.selectedId);
  if (!part) return;
  const anchor = part.data.anchor;
  selectionSprite.position.set(
    anchor[0] + part.group.position.x,
    anchor[1] + part.group.position.y,
    anchor[2] + part.group.position.z
  );
  const pulse = 0.9 + Math.sin(elapsed * 2.8) * 0.18;
  selectionSprite.scale.set(1.1 + pulse * 0.3, 1.1 + pulse * 0.3, 1);
  selectionSprite.material.opacity = 0.36 + (pulse - 0.72) * 0.48;
}

// ------------------------------------------------------------
// Camera movement
// ------------------------------------------------------------

function fitDistance() {
  if (!camera) return 24;
  const verticalFov = THREE.MathUtils.degToRad(camera.fov);
  const aspect = Math.max(0.38, camera.aspect || 1);
  const width = W + 2.8;
  const height = H + 2.3;
  const distV = (height / 2) / Math.tan(verticalFov / 2);
  const distH = (width / 2) / (Math.tan(verticalFov / 2) * aspect);
  return clamp(Math.max(distV, distH) * 1.045 + 2.2, 16, 62);
}

function viewPose(name) {
  const distance = fitDistance();
  switch (name) {
    case 'rear':
      return { position: new THREE.Vector3(0, 0.7, -distance), target: new THREE.Vector3(0, 0.1, 0) };
    case 'iso':
      return {
        position: new THREE.Vector3(distance * 0.62, distance * 0.4, distance * 0.66),
        target: new THREE.Vector3(0, 0.05, 0)
      };
    case 'top':
      return {
        position: new THREE.Vector3(0.001, distance * 1.02, distance * 0.16),
        target: new THREE.Vector3(0, 0, 0)
      };
    case 'front':
    default:
      return {
        position: new THREE.Vector3(0, 0.55, distance),
        target: new THREE.Vector3(0, 0.05, 0)
      };
  }
}

function flyCamera(position, target, duration = 0.95, onDone = null) {
  cameraTween = {
    fromPosition: camera.position.clone(),
    toPosition: position.clone(),
    fromTarget: controls.target.clone(),
    toTarget: target.clone(),
    elapsed: 0,
    duration: Math.max(duration, 0.2),
    onDone,
    autoRotate: state.autoRotate
  };
  controls.autoRotate = false;
  controls.enabled = false;
}

function updateCameraTween(delta) {
  if (!cameraTween) return;
  cameraTween.elapsed += delta;
  const t = clamp(cameraTween.elapsed / cameraTween.duration, 0, 1);
  const eased = smoothstep(t);
  camera.position.lerpVectors(cameraTween.fromPosition, cameraTween.toPosition, eased);
  controls.target.lerpVectors(cameraTween.fromTarget, cameraTween.toTarget, eased);
  camera.lookAt(controls.target);
  if (t >= 1) {
    const finished = cameraTween;
    cameraTween = null;
    controls.enabled = true;
    controls.autoRotate = finished.autoRotate && state.autoRotate;
    controls.update();
    if (typeof finished.onDone === 'function') finished.onDone();
  }
}

function cancelCameraTween() {
  if (!cameraTween) return;
  cameraTween = null;
  controls.enabled = true;
  controls.autoRotate = state.autoRotate;
}

function setView(name, immediate = false) {
  state.view = name;
  const pose = viewPose(name);
  $$('#viewButtons button').forEach((button) => {
    button.classList.toggle('is-active', button.dataset.view === name);
  });
  if (immediate) {
    cameraTween = null;
    controls.enabled = true;
    camera.position.copy(pose.position);
    controls.target.copy(pose.target);
    camera.lookAt(controls.target);
    controls.update();
    controls.autoRotate = state.autoRotate;
  } else {
    setAutoRotate(false, true);
    flyCamera(pose.position, pose.target, 0.9);
  }
}

function focusPart(id, immediate = false) {
  const part = parts.get(id);
  if (!part) return;
  const box = new THREE.Box3().setFromObject(part.group);
  const sphere = new THREE.Sphere();
  if (box.isEmpty()) {
    box.setFromCenterAndSize(
      new THREE.Vector3(...part.data.anchor),
      new THREE.Vector3(1, 1, 1)
    );
  }
  box.getBoundingSphere(sphere);
  const center = sphere.center.clone();
  const direction = new THREE.Vector3().subVectors(camera.position, controls.target);
  if (direction.lengthSq() < 0.001) direction.set(0.5, 0.3, 0.8);
  direction.normalize();
  const distance = clamp(Math.max(part.data.focusDistance || 8, sphere.radius * 2.5), 4.2, 30);
  const position = center.clone().addScaledVector(direction, distance);
  setAutoRotate(false, true);
  if (immediate) {
    camera.position.copy(position);
    controls.target.copy(center);
    camera.lookAt(center);
    controls.update();
  } else {
    flyCamera(position, center, 0.95);
  }
}

// ------------------------------------------------------------
// Procedural device — helpers
// ------------------------------------------------------------

function put(group, object, { noShadow = false, skipPick = false, renderOrder = null } = {}) {
  if (noShadow) object.userData.noShadow = true;
  if (skipPick) object.userData.skipPick = true;
  if (typeof renderOrder === 'number') object.renderOrder = renderOrder;
  group.add(object);
  return object;
}

function addRounded(group, w, h, d, radius, material, x, y, z, options = {}) {
  const mesh = makeRoundedBox(w, h, d, radius, material);
  mesh.position.set(x, y, z);
  if (options.rotation) mesh.rotation.set(...options.rotation);
  return put(group, mesh, options);
}

function addCylinderZ(group, radiusTop, radiusBottom, depth, segments, material, x, y, z, options = {}) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(radiusTop, radiusBottom, depth, segments), material);
  mesh.rotation.x = Math.PI / 2;
  mesh.position.set(x, y, z);
  return put(group, mesh, options);
}

function addRingZ(group, radius, tube, material, x, y, z, options = {}) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 64), material);
  mesh.position.set(x, y, z);
  return put(group, mesh, options);
}

function addEdgeLine(group, geometry, color, opacity = 0.2, options = {}) {
  const edges = new THREE.EdgesGeometry(geometry, 32);
  const line = new THREE.LineSegments(edges, lineMaterial(color, opacity));
  line.userData.noShadow = true;
  line.userData.skipPick = true;
  return put(group, line, options);
}

function helixPoints(radius, height, turns, x, z, centerY, segments = 96) {
  const points = [];
  for (let i = 0; i <= segments; i++) {
    const t = i / segments;
    const angle = t * Math.PI * 2 * turns;
    points.push(new THREE.Vector3(
      x + Math.cos(angle) * radius,
      centerY - height / 2 + t * height,
      z + Math.sin(angle) * radius
    ));
  }
  return points;
}

// ------------------------------------------------------------
// Device — display stack
// ------------------------------------------------------------

function buildInnerDisplay() {
  const group = new THREE.Group();

  const bezelShape = roundedRectShape(W - 0.17, H - 0.17, 0.57);
  const bezel = extrudeShape(bezelShape, 0.052, { bevel: 0.008, curveSegments: 24 });
  bezel.material = MAT.black;
  bezel.position.z = 0.218;
  put(group, bezel);

  const screenShape = roundedRectShape(W - 0.34, H - 0.34, 0.52);
  const screen = texturedShapeMesh(screenShape, TEX.screen, {
    color: 0xdde9e8,
    roughness: 0.21,
    metalness: 0.02,
    emissive: 0xffffff,
    emissiveIntensity: 0.92
  });
  screen.position.z = 0.253;
  put(group, screen);

  const glass = new THREE.Mesh(new THREE.ShapeGeometry(screenShape, 40), MAT.screenGlass);
  glass.position.z = 0.258;
  put(group, glass, { noShadow: true, skipPick: true, renderOrder: 3 });

  const screenEdge = addEdgeLine(group, new THREE.ShapeGeometry(screenShape, 24), 0x96f7e7, 0.18, { noShadow: true, skipPick: true });
  screenEdge.position.z = 0.26;

  const creaseMaterial = new THREE.MeshBasicMaterial({
    color: 0x051014,
    transparent: true,
    opacity: 0.32,
    depthWrite: false,
    toneMapped: false
  });
  const crease = new THREE.Mesh(new THREE.PlaneGeometry(0.035, H - 0.52), creaseMaterial);
  crease.position.set(0, 0, 0.256);
  put(group, crease, { noShadow: true, skipPick: true, renderOrder: 4 });

  // Display driver flex disappearing behind the panel
  const flex = new THREE.Mesh(new THREE.PlaneGeometry(1.35, 0.3), MAT.polyimide);
  flex.position.set(-2.7, -5.62, 0.226);
  put(group, flex, { noShadow: true, skipPick: true });

  registerPart('innerDisplay', group);
}

function buildCoverLayer() {
  const group = new THREE.Group();
  const shape = roundedRectShape(W - 0.24, H - 0.24, 0.56);
  const glass = extrudeShape(shape, 0.023, { bevel: 0.005, curveSegments: 32 });
  glass.material = MAT.coverGlass;
  glass.position.z = 0.286;
  put(group, glass, { noShadow: true, skipPick: true });

  const glassEdge = addEdgeLine(group, new THREE.ShapeGeometry(shape, 32), 0xb9fff3, 0.16, { noShadow: true, skipPick: true });
  glassEdge.position.z = 0.303;

  // A faint anti-reflective sheen near the upper-left corner
  const sheenMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9fff8,
    transparent: true,
    opacity: 0.035,
    depthWrite: false,
    side: THREE.DoubleSide,
    blending: THREE.AdditiveBlending,
    toneMapped: false
  });
  const sheen = new THREE.Mesh(new THREE.PlaneGeometry(W * 0.6, H * 0.34), sheenMaterial);
  sheen.position.set(-2.4, 2.8, 0.299);
  sheen.rotation.z = -0.19;
  put(group, sheen, { noShadow: true, skipPick: true, renderOrder: 5 });

  registerPart('coverLayer', group);
}

function buildDisplayPlate() {
  const group = new THREE.Group();
  const plateShape = roundedRectShape(W - 0.31, H - 0.31, 0.55);

  const backing = extrudeShape(plateShape, 0.026, { bevel: 0.008, curveSegments: 24 });
  backing.material = MAT.titaniumPlate;
  backing.position.z = 0.19;
  put(group, backing);

  const graphiteShape = roundedRectShape(W - 0.44, H - 0.44, 0.5);
  const graphite = extrudeShape(graphiteShape, 0.015, { bevel: 0.004, curveSegments: 20 });
  graphite.material = MAT.graphite;
  graphite.position.z = 0.175;
  put(group, graphite);

  const foamShape = roundedRectShape(W - 0.56, H - 0.56, 0.47);
  const foam = extrudeShape(foamShape, 0.008, { bevel: 0.002, curveSegments: 20 });
  foam.material = MAT.rubber;
  foam.position.z = 0.202;
  put(group, foam);

  const gripMaterial = lineMaterial(0x6de4d9, 0.11);
  const gridPoints = [];
  for (let i = -5; i <= 5; i++) {
    gridPoints.push(
      new THREE.Vector3(i * 1.18, -4.95, 0.209),
      new THREE.Vector3(i * 1.18, 4.95, 0.209)
    );
  }
  for (let i = -4; i <= 4; i++) {
    gridPoints.push(
      new THREE.Vector3(-6.7, i * 1.16, 0.209),
      new THREE.Vector3(6.7, i * 1.16, 0.209)
    );
  }
  const grid = segment(gridPoints, gripMaterial);
  grid.userData.noShadow = true;
  put(group, grid);

  const centralRail = makeRoundedBox(0.075, H - 1.1, 0.012, 0.02, MAT.metal);
  centralRail.position.set(0, 0, 0.208);
  put(group, centralRail, { noShadow: true, skipPick: true });

  const pinPositions = [
    [-7.55, 4.65], [7.5, 4.4], [-7.6, -4.7], [7.45, -4.55],
    [-2.2, 5.35], [2.2, -5.35]
  ];
  for (const [x, y] of pinPositions) {
    addCylinderZ(group, 0.048, 0.048, 0.022, 10, MAT.metal, x, y, 0.212, { noShadow: true, skipPick: true });
  }

  registerPart('displayPlate', group);
}

function buildOuterDisplay() {
  const group = new THREE.Group();
  const backShape = halfRectShape(HALF_W - 0.01, H - 0.04, 0.6, 1);

  const backing = extrudeShape(backShape, 0.028, { bevel: 0.006, curveSegments: 24 });
  backing.material = MAT.black;
  backing.position.set(HALF_X, 0, -0.232);
  put(group, backing);

  const activeShape = roundedRectShape(7.63, 11.25, 0.51);
  const screen = texturedShapeMesh(activeShape, TEX.outerScreen, {
    color: 0xd8e5e4,
    roughness: 0.18,
    metalness: 0.02,
    emissive: 0xffffff,
    emissiveIntensity: 0.8
  });
  screen.position.set(HALF_X, 0, -0.254);
  screen.rotation.y = Math.PI;
  put(group, screen);

  const glass = new THREE.Mesh(new THREE.ShapeGeometry(activeShape, 40), MAT.screenGlass);
  glass.position.set(HALF_X, 0, -0.261);
  glass.rotation.y = Math.PI;
  put(group, glass, { noShadow: true, skipPick: true, renderOrder: 3 });

  const displayEdge = addEdgeLine(group, new THREE.ShapeGeometry(activeShape, 32), 0x9deee5, 0.15, { noShadow: true, skipPick: true });
  displayEdge.position.set(HALF_X, 0, -0.264);
  displayEdge.rotation.y = Math.PI;

  const slit = makeRoundedBox(0.52, 0.024, 0.012, 0.01, MAT.black);
  slit.position.set(HALF_X, 5.55, -0.265);
  put(group, slit, { noShadow: true, skipPick: true });

  // Inner shield / stiffener visible when the outer panel is lifted
  const stiffener = makeRoundedBox(6.85, 10.6, 0.018, 0.08, MAT.graphite);
  stiffener.position.set(HALF_X, 0, -0.208);
  put(group, stiffener, { noShadow: true, skipPick: true });

  registerPart('outerDisplay', group);
}

function buildBackGlass() {
  const group = new THREE.Group();
  const shape = halfRectShape(HALF_W - 0.02, H - 0.04, 0.6, -1);

  const glass = extrudeShape(shape, 0.05, { bevel: 0.01, curveSegments: 32 });
  glass.material = MAT.backGlass;
  glass.position.set(-HALF_X, 0, -0.236);
  put(group, glass);

  const inner = extrudeShape(halfRectShape(HALF_W - 0.2, H - 0.22, 0.52, -1), 0.016, { bevel: 0.003 });
  inner.material = MAT.backGlassInner;
  inner.position.set(-HALF_X, 0, -0.203);
  put(group, inner, { noShadow: true, skipPick: true });

  const logo = new THREE.Mesh(new THREE.PlaneGeometry(1.55, 1.55), MAT.logo);
  logo.position.set(-HALF_X, -0.15, -0.267);
  logo.rotation.y = Math.PI;
  put(group, logo, { noShadow: true, skipPick: true, renderOrder: 4 });

  const regulatory = new THREE.Mesh(new THREE.PlaneGeometry(1.7, 0.38), MAT.regulatory);
  regulatory.position.set(-HALF_X, -5.16, -0.267);
  regulatory.rotation.y = Math.PI;
  put(group, regulatory, { noShadow: true, skipPick: true, renderOrder: 4 });

  // MagSafe / Qi2 coil array on the inner face
  const coilCenterX = -HALF_X;
  const coilCenterY = 0.25;
  addRingZ(group, 1.32, 0.022, MAT.copper, coilCenterX, coilCenterY, -0.195, { noShadow: true, skipPick: true });
  addRingZ(group, 1.12, 0.011, MAT.gold, coilCenterX, coilCenterY, -0.194, { noShadow: true, skipPick: true });
  addRingZ(group, 0.82, 0.008, MAT.copper, coilCenterX, coilCenterY, -0.194, { noShadow: true, skipPick: true });
  const magnetMaterial = MAT.magnet;
  for (let i = 0; i < 8; i++) {
    const angle = (i / 8) * Math.PI * 2;
    const magnet = makeRoundedBox(0.3, 0.09, 0.018, 0.02, magnetMaterial);
    magnet.position.set(
      coilCenterX + Math.cos(angle) * 1.58,
      coilCenterY + Math.sin(angle) * 1.58,
      -0.196
    );
    magnet.rotation.z = angle + Math.PI / 2;
    put(group, magnet, { noShadow: true, skipPick: true });
  }

  // Camera island structural shelf
  const shelf = makeRoundedBox(4.28, 1.98, 0.04, 0.18, MAT.graphite);
  shelf.position.set(-5.1, 4.58, -0.19);
  put(group, shelf, { noShadow: true, skipPick: true });

  // NFC / antenna flex around the coil
  const antennaCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-7.45, 3.85, -0.197),
    new THREE.Vector3(-2.2, 4.85, -0.197),
    new THREE.Vector3(-1.35, 4.25, -0.197),
    new THREE.Vector3(-1.4, 3.7, -0.197)
  ]);
  const antennaRibbon = makeRibbon(antennaCurve, 0.19, MAT.polyimide, 56, new THREE.Vector3(0, 1, 0));
  antennaRibbon.userData.noShadow = true;
  antennaRibbon.userData.skipPick = true;
  group.add(antennaRibbon);

  const antennaTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(antennaCurve.getPoints(50)),
    lineMaterial(0xd8a35e, 0.7)
  );
  antennaTrace.position.z = 0.004;
  antennaTrace.userData.noShadow = true;
  antennaTrace.userData.skipPick = true;
  group.add(antennaTrace);

  registerPart('backGlass', group);
}

function buildEnclosure() {
  const group = new THREE.Group();

  const makeFrame = (side) => {
    const outline = halfRectShape(HALF_W, H, 0.63, side);
    const hole = halfRectShape(HALF_W - 0.33, H - 0.33, 0.5, side);
    outline.holes.push(hole);
    const frame = extrudeShape(outline, 0.46, { bevel: 0.012, curveSegments: 32, materials: [MAT.frame, MAT.frameSide] });
    frame.position.set(side * HALF_X, 0, 0);
    return frame;
  };

  for (const side of [-1, 1]) {
    const frame = makeFrame(side);
    put(group, frame);

    const sideEdge = side * (HALF_X + HALF_W / 2);
    for (const y of [-4.35, -2.55, 1.15, 3.28]) {
      const band = makeRoundedBox(0.024, 0.105, 0.482, 0.008, MAT.antenna);
      band.position.set(sideEdge, y, 0);
      put(group, band, { noShadow: true, skipPick: true });
    }

    for (const y of [-5.62, 5.62]) {
      const cap = makeRoundedBox(HALF_W - 0.12, 0.035, 0.47, 0.017, MAT.frameSide);
      cap.position.set(side * HALF_X, y, 0);
      put(group, cap, { noShadow: true, skipPick: true });
    }
  }

  // USB-C aperture and speaker apertures are cut into the lower edge as dark insets.
  const portInset = makeRoundedBox(0.9, 0.032, 0.3, 0.05, MAT.black);
  portInset.position.set(4.6, -5.858, -0.01);
  put(group, portInset, { noShadow: true, skipPick: true });

  for (const x of [5.7, 5.86, 6.02, 6.18, 6.34, 6.5]) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.022, 8), MAT.black);
    hole.position.set(x, -5.862, 0.01);
    put(group, hole, { noShadow: true, skipPick: true });
  }

  // Alignment pads beside the hinge
  for (const side of [-1, 1]) {
    for (const y of [-2.1, 2.1]) {
      const pad = makeRoundedBox(0.15, 0.3, 0.03, 0.02, MAT.magnet);
      pad.position.set(side * 0.32, y, 0.205);
      put(group, pad, { noShadow: true, skipPick: true });
    }
  }

  // Fine machined highlight along the outer rail
  const railPoints = [];
  for (let i = 0; i < 2; i++) {
    const side = i === 0 ? -1 : 1;
    const x = side * (HALF_X + HALF_W / 2 + 0.001);
    railPoints.push(
      new THREE.Vector3(x, -4.8, 0.16),
      new THREE.Vector3(x, -4.8, 0.2),
      new THREE.Vector3(x, 4.8, 0.2),
      new THREE.Vector3(x, 4.8, 0.16)
    );
  }
  const railHighlight = segment(railPoints, lineMaterial(0xd9ffff, 0.22));
  railHighlight.userData.noShadow = true;
  railHighlight.userData.skipPick = true;
  group.add(railHighlight);

  registerPart('enclosure', group);
}

function makeGear(radius, teeth, thickness, material) {
  const group = new THREE.Group();
  const body = new THREE.Mesh(new THREE.CylinderGeometry(radius, radius, thickness, 24), material);
  body.rotation.x = Math.PI / 2;
  group.add(body);

  for (let i = 0; i < teeth; i++) {
    const angle = (i / teeth) * Math.PI * 2;
    const tooth = makeRoundedBox(radius * 0.34, radius * 0.17, thickness * 0.94, 0.006, material);
    tooth.position.set(
      Math.cos(angle) * (radius + radius * 0.1),
      Math.sin(angle) * (radius + radius * 0.1),
      0
    );
    tooth.rotation.z = angle;
    tooth.userData.noShadow = true;
    group.add(tooth);
  }

  const axle = new THREE.Mesh(new THREE.CylinderGeometry(radius * 0.23, radius * 0.23, thickness * 1.35, 12), MAT.hingeDark);
  axle.rotation.x = Math.PI / 2;
  group.add(axle);
  return group;
}

function buildHinge() {
  const group = new THREE.Group();

  const spine = makeRoundedBox(0.5, 10.75, 0.32, 0.09, MAT.hinge);
  spine.position.set(0, 0, -0.11);
  put(group, spine);

  const spineInset = makeRoundedBox(0.24, 9.4, 0.02, 0.04, MAT.hingeDark);
  spineInset.position.set(0, 0, -0.279);
  put(group, spineInset, { noShadow: true, skipPick: true });

  // Exposed 3D-printed hinge caps
  for (const side of [-1, 1]) {
    const capY = side * 5.52;
    const cap = makeRoundedBox(0.86, 0.58, 0.55, 0.09, MAT.hinge);
    cap.position.set(0, capY, -0.02);
    put(group, cap);

    for (let i = 0; i < 3; i++) {
      const rib = makeRoundedBox(0.68, 0.025, 0.035, 0.01, MAT.hingeDark);
      rib.position.set(0, capY - 0.15 + i * 0.15, -0.3);
      put(group, rib, { noShadow: true, skipPick: true });
    }

    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.008, 6), MAT.hingeDark);
      dot.rotation.x = Math.PI / 2;
      dot.position.set(Math.cos(angle) * 0.29, capY + Math.sin(angle) * 0.18, -0.3);
      dot.userData.noShadow = true;
      dot.userData.skipPick = true;
      group.add(dot);
    }
  }

  // Gear train visible once the hinge is lifted out
  const gearPositions = [
    [0, 3.88, -0.035, 0.29, 16, 0.1],
    [0, 3.47, 0.005, 0.22, 14, -0.16],
    [0, -3.5, -0.01, 0.27, 15, 0.24],
    [0, -3.92, -0.055, 0.2, 13, -0.1],
    [0, 0.18, -0.02, 0.34, 18, 0.08],
    [0, -0.3, -0.045, 0.25, 15, -0.21]
  ];
  for (const [x, y, z, radius, teeth, angle] of gearPositions) {
    const gear = makeGear(radius, teeth, 0.075, MAT.metal);
    gear.position.set(x, y, z);
    gear.rotation.z = angle;
    put(group, gear);
  }

  // Variable-torque cam stack
  for (let i = 0; i < 4; i++) {
    const cam = addCylinderZ(group, 0.22 - i * 0.014, 0.22 - i * 0.014, 0.035, 10, MAT.metal, 0, 2.75, -0.06 + i * 0.045, { noShadow: true });
    cam.rotation.z = i * 0.26;
  }

  for (const x of [-0.19, 0.19]) {
    const springPoints = helixPoints(0.075, 1.2, 9, x, 0.06, -4.35);
    const spring = new THREE.Mesh(
      new THREE.TubeGeometry(new THREE.CatmullRomCurve3(springPoints), 120, 0.014, 5, false),
      MAT.metal
    );
    spring.userData.noShadow = true;
    spring.userData.skipPick = true;
    group.add(spring);
  }

  // Magnet array for suspended-angle holding
  for (let i = 0; i < 10; i++) {
    const magnet = makeRoundedBox(0.13, 0.16, 0.035, 0.01, MAT.magnet);
    magnet.position.set(0.28, -4.0 + i * 0.58, -0.18);
    put(group, magnet, { noShadow: true, skipPick: true });
  }

  // Center guide rail
  const rail = makeRoundedBox(0.055, 9.2, 0.05, 0.02, MAT.metal);
  rail.position.set(0, 0, 0.065);
  put(group, rail, { noShadow: true, skipPick: true });

  const accent = makeRoundedBox(0.018, 1.5, 0.01, 0.005, MAT.gold);
  accent.position.set(0, 4.55, -0.3);
  put(group, accent, { noShadow: true, skipPick: true });

  registerPart('hinge', group);
}

// ------------------------------------------------------------
// Device — logic board, I/O, power
// ------------------------------------------------------------

function addChipFace(group, texture, x, y, width, height, baseZ, options = {}) {
  const packageHeight = options.height || 0.055;
  const tone = options.tone || 'dark';
  const packageMaterial = tone === 'light' ? MAT.chipLight : MAT.chip;
  const base = makeRoundedBox(width + 0.07, height + 0.07, packageHeight, 0.018, packageMaterial);
  base.position.set(x, y, baseZ + packageHeight / 2);
  put(group, base, { noShadow: options.noShadow !== false });

  const faceMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    color: tone === 'light' ? 0xd8dcdb : 0xc6cecd,
    roughness: tone === 'light' ? 0.32 : 0.42,
    metalness: tone === 'light' ? 0.55 : 0.34,
    emissive: 0x0a0c0d,
    emissiveIntensity: 0.08
  });
  const face = new THREE.Mesh(new THREE.PlaneGeometry(width, height), faceMaterial);
  face.position.set(x, y, baseZ + packageHeight + 0.0015);
  put(group, face, { noShadow: true });

  const dotMaterial = MAT.gold;
  for (const [dx, dy] of [
    [-width / 2 - 0.012, -height / 2 - 0.012],
    [width / 2 + 0.012, height / 2 + 0.012]
  ]) {
    const dot = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.008, 6), dotMaterial);
    dot.rotation.x = Math.PI / 2;
    dot.position.set(x + dx, y + dy, baseZ + packageHeight + 0.002);
    put(group, dot, { noShadow: true, skipPick: true });
  }
}

function addBoardConnector(group, x, y, width, height, pins = 7) {
  const body = makeRoundedBox(width, height, 0.035, 0.01, MAT.rubber);
  body.position.set(x, y, 0.077);
  put(group, body, { noShadow: true, skipPick: true });
  const vertical = height > width;
  for (let i = 0; i < pins; i++) {
    const t = pins === 1 ? 0.5 : i / (pins - 1);
    const pin = new THREE.Mesh(new THREE.BoxGeometry(
      vertical ? width * 0.55 : width / (pins * 1.7),
      0.012,
      vertical ? height / (pins * 1.8) : height * 0.55
    ), MAT.gold);
    pin.position.set(
      vertical ? x : x - width / 2 + t * width,
      vertical ? y - height / 2 + t * height : y,
      0.095
    );
    put(group, pin, { noShadow: true, skipPick: true });
  }
}

function buildLogicBoard() {
  const group = new THREE.Group();
  const shape = roundedRectShape(6.8, 4.55, 0.27);
  const centerX = -4.08;
  const centerY = 1.32;

  const substrate = extrudeShape(shape, 0.055, { bevel: 0.006, curveSegments: 20 });
  substrate.material = MAT.boardSide;
  substrate.position.set(centerX, centerY, 0.024);
  put(group, substrate);

  const pcbFace = texturedShapeMesh(shape, TEX.pcb, {
    color: 0x94ad9c,
    roughness: 0.6,
    metalness: 0.16,
    emissive: 0x09100c,
    emissiveIntensity: 0.1
  });
  pcbFace.position.set(centerX, centerY, 0.0525);
  put(group, pcbFace);

  addEdgeLine(group, new THREE.ShapeGeometry(shape, 24), 0xd6a353, 0.16, { noShadow: true, skipPick: true });

  // Main silicon
  addChipFace(group, TEX.chipA20, -4.55, 1.72, 1.08, 1.08, 0.055, { height: 0.082 });
  addChipFace(group, TEX.chipC2, -2.78, 0.48, 0.72, 0.72, 0.055, { height: 0.05 });
  addChipFace(group, TEX.chipN1, -5.65, 0.47, 0.48, 0.48, 0.055, { height: 0.045 });
  addChipFace(group, TEX.chipNand, -2.62, 2.62, 0.83, 0.58, 0.055, { height: 0.046, tone: 'light' });
  addChipFace(group, TEX.chipPmic, -5.32, 2.62, 0.53, 0.42, 0.055, { height: 0.04 });
  addChipFace(group, TEX.chipRf, -1.5, 2.38, 0.4, 0.56, 0.055, { height: 0.04, tone: 'light' });

  // Shield cans
  const cans = [
    [-1.42, 0.85, 0.98, 1.34],
    [-6.42, 1.55, 0.6, 1.6],
    [-3.75, 3.2, 1.55, 0.46]
  ];
  for (const [x, y, w, h] of cans) {
    const can = makeRoundedBox(w, h, 0.07, 0.018, MAT.shield);
    can.position.set(x, y, 0.094);
    put(group, can, { noShadow: true });
    const linePoints = [];
    for (let i = 0; i < 4; i++) {
      const lx = x - w / 2 + 0.09 + i * (w - 0.18) / 3;
      linePoints.push(
        new THREE.Vector3(lx, y - h / 2 + 0.09, 0.131),
        new THREE.Vector3(lx, y + h / 2 - 0.09, 0.131)
      );
    }
    const canLines = segment(linePoints, lineMaterial(0x2e3637, 0.5, true));
    canLines.userData.noShadow = true;
    canLines.userData.skipPick = true;
    group.add(canLines);
  }

  // Passive components scattered across the board
  const random = seededRandom(6421);
  const passives = [];
  for (let i = 0; i < 42; i++) {
    const w = 0.035 + random() * 0.06;
    const h = 0.025 + random() * 0.05;
    const x = -7.3 + random() * 6.2;
    const y = -0.75 + random() * 3.72;
    if (Math.abs(x + 4.55) < 0.72 && Math.abs(y - 1.72) < 0.72) continue;
    const material = i % 7 === 0 ? MAT.gold : (i % 3 === 0 ? MAT.chipLight : MAT.screwBlack);
    const part = new THREE.Mesh(new THREE.BoxGeometry(w, h, 0.022), material);
    part.position.set(x, y, 0.066);
    put(group, part, { noShadow: true, skipPick: true });
    passives.push(part);
  }

  // Connectors and board-to-board links
  addBoardConnector(group, -1.04, 1.64, 0.16, 0.72, 8);
  addBoardConnector(group, -1.32, -0.3, 0.55, 0.13, 6);
  addBoardConnector(group, -7.02, 1.48, 0.14, 0.8, 7);
  addBoardConnector(group, -3.1, -0.52, 0.6, 0.12, 5);

  const mounts = [
    [-7.18, 3.38], [-0.96, 3.38], [-7.18, -0.58], [-0.96, -0.58]
  ];
  for (const [x, y] of mounts) {
    addRingZ(group, 0.055, 0.011, MAT.gold, x, y, 0.0605, { noShadow: true, skipPick: true });
    const pad = new THREE.Mesh(new THREE.CylinderGeometry(0.085, 0.085, 0.006, 16), MAT.chipLight);
    pad.rotation.x = Math.PI / 2;
    pad.position.set(x, y, 0.057);
    put(group, pad, { noShadow: true, skipPick: true });
  }

  // Board-to-hinge data flex
  const flexCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-0.96, 1.55, 0.062),
    new THREE.Vector3(-0.6, 1.55, 0.085),
    new THREE.Vector3(-0.24, 1.68, 0.098),
    new THREE.Vector3(0.16, 1.66, 0.094)
  ]);
  const flex = makeRibbon(flexCurve, 0.29, MAT.polyimide, 46, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  const flexTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(flexCurve.getPoints(50)),
    lineMaterial(0xf0c47b, 0.82)
  );
  flexTrace.position.z = 0.006;
  flexTrace.userData.noShadow = true;
  flexTrace.userData.skipPick = true;
  group.add(flexTrace);

  const connector = makeRoundedBox(0.34, 0.46, 0.05, 0.02, MAT.black);
  connector.position.set(-0.9, 1.55, 0.082);
  put(group, connector, { noShadow: true });

  registerPart('logicBoard', group);
}

function buildIoBoard() {
  const group = new THREE.Group();
  const shape = roundedRectShape(1.92, 1.28, 0.18);
  const x = 4.55;
  const y = -4.82;

  const substrate = extrudeShape(shape, 0.038, { bevel: 0.005, curveSegments: 16 });
  substrate.material = MAT.boardSide;
  substrate.position.set(x, y, 0.04);
  put(group, substrate);

  const face = texturedShapeMesh(shape, TEX.pcb, {
    color: 0x91a897,
    roughness: 0.62,
    metalness: 0.14
  });
  face.position.set(x, y, 0.0605);
  put(group, face);

  addChipFace(group, TEX.chipPmic, x + 0.24, y + 0.2, 0.34, 0.3, 0.061, { height: 0.032, noShadow: true });
  addChipFace(group, TEX.chipC2, x - 0.38, y - 0.25, 0.26, 0.26, 0.061, { height: 0.026, noShadow: true });

  addBoardConnector(group, x + 0.68, y + 0.08, 0.12, 0.42, 5);
  addBoardConnector(group, x - 0.72, y + 0.3, 0.11, 0.35, 4);

  for (const [dx, dy] of [[-0.74, -0.43], [0.76, -0.45]]) {
    addRingZ(group, 0.045, 0.01, MAT.gold, x + dx, y + dy, 0.063, { noShadow: true, skipPick: true });
  }

  // Long flex running to the interposer along the right edge
  const flexCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(x + 0.5, y + 0.58, 0.064),
    new THREE.Vector3(7.15, -3.7, 0.07),
    new THREE.Vector3(7.28, -2.0, 0.075),
    new THREE.Vector3(7.2, -0.1, 0.08),
    new THREE.Vector3(6.25, 1.0, 0.08)
  ]);
  const flex = makeRibbon(flexCurve, 0.31, MAT.polyimide, 90, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  for (const offset of [-0.075, 0, 0.075]) {
    const points = flexCurve.getPoints(80).map((point) => new THREE.Vector3(point.x, point.y + offset, point.z + 0.005));
    const trace = new THREE.Line(new THREE.BufferGeometry().setFromPoints(points), lineMaterial(0xe3b56c, 0.6));
    trace.userData.noShadow = true;
    trace.userData.skipPick = true;
    group.add(trace);
  }

  registerPart('ioBoard', group);
}

function buildBattery(id, variant) {
  const group = new THREE.Group();
  const isFirst = variant === 1;
  const width = isFirst ? 5.7 : 6.55;
  const height = isFirst ? 4.2 : 3.35;
  const x = isFirst ? -4.55 : 4.15;
  const y = isFirst ? -3.3 : -1.95;
  const texture = isFirst ? TEX.battery1 : TEX.battery2;
  const material = isFirst ? MAT.battery : MAT.battery2;
  const shape = roundedRectShape(width, height, 0.29);

  const body = extrudeShape(shape, 0.19, { bevel: 0.014, curveSegments: 20 });
  body.material = MAT.batteryEdge;
  body.position.set(x, y, 0);
  put(group, body);

  const face = texturedShapeMesh(shape, texture, {
    color: 0xd4ddd8,
    roughness: 0.6,
    metalness: 0.2,
    emissive: 0x090806,
    emissiveIntensity: 0.08
  });
  face.position.set(x, y, 0.0975);
  put(group, face);

  // Cell divider grooves
  const dividerPoints = [];
  for (let i = 1; i < 3; i++) {
    const dy = y - height / 2 + (height / 3) * i;
    dividerPoints.push(
      new THREE.Vector3(x - width / 2 + 0.16, dy, 0.1005),
      new THREE.Vector3(x + width / 2 - 0.16, dy, 0.1005)
    );
  }
  const grooves = segment(dividerPoints, lineMaterial(0x353d3e, 0.45, true));
  grooves.userData.noShadow = true;
  grooves.userData.skipPick = true;
  group.add(grooves);

  // Pull tabs
  const tabColors = [0xd5a448, 0x8eb8a1];
  for (let i = 0; i < 2; i++) {
    const tabMaterial = new THREE.MeshStandardMaterial({
      color: tabColors[i],
      metalness: 0.05,
      roughness: 0.74,
      side: THREE.DoubleSide
    });
    const tab = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.18), tabMaterial);
    tab.position.set(x - 0.5 + i * 0.8, y - height / 2 + 0.16, 0.103);
    put(group, tab, { noShadow: true, skipPick: true });
  }

  // Protection circuit and connector
  const pcb = makeRoundedBox(0.94, 0.2, 0.035, 0.03, MAT.boardSide);
  pcb.position.set(x + width / 2 - 0.7, y + height / 2 - 0.12, 0.11);
  put(group, pcb, { noShadow: true });

  const batteryConnector = makeRoundedBox(0.34, 0.16, 0.04, 0.02, MAT.gold);
  batteryConnector.position.set(x + width / 2 - 0.55, y + height / 2 - 0.12, 0.132);
  put(group, batteryConnector, { noShadow: true, skipPick: true });

  const flexCurve = isFirst
    ? new THREE.CatmullRomCurve3([
      new THREE.Vector3(x + width / 2 - 0.55, y + height / 2 - 0.12, 0.12),
      new THREE.Vector3(-2.2, -1.0, 0.13),
      new THREE.Vector3(-1.75, -0.72, 0.1),
      new THREE.Vector3(-1.35, -0.5, 0.085)
    ])
    : new THREE.CatmullRomCurve3([
      new THREE.Vector3(x + width / 2 - 0.55, y + height / 2 - 0.12, 0.12),
      new THREE.Vector3(5.7, -0.18, 0.12),
      new THREE.Vector3(5.0, 0.15, 0.1)
    ]);
  const flex = makeRibbon(flexCurve, 0.22, MAT.polyimide, 54, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  const flexTrace = new THREE.Line(
    new THREE.BufferGeometry().setFromPoints(flexCurve.getPoints(54)),
    lineMaterial(0xe3b567, 0.6)
  );
  flexTrace.position.z = 0.005;
  flexTrace.userData.noShadow = true;
  flexTrace.userData.skipPick = true;
  group.add(flexTrace);

  // QR / serial etched into the top right area
  const codeMaterial = new THREE.MeshBasicMaterial({
    color: 0xc9ccc8,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
    toneMapped: false
  });
  for (let i = 0; i < 12; i++) {
    const random = seededRandom(2100 + i * 7);
    const code = new THREE.Mesh(new THREE.PlaneGeometry(0.02 + random() * 0.04, 0.02 + random() * 0.04), codeMaterial);
    code.position.set(
      x + width / 2 - 0.34,
      y + height / 2 - 0.58 + (i % 4) * 0.055,
      0.102
    );
    code.position.x += Math.floor(i / 4) * 0.06;
    put(group, code, { noShadow: true, skipPick: true });
  }

  registerPart(id, group);
}

function buildBattery1() {
  buildBattery('battery1', 1);
}

function buildBattery2() {
  buildBattery('battery2', 2);
}

// ------------------------------------------------------------
// Device — camera systems
// ------------------------------------------------------------

function buildCameraModule() {
  const group = new THREE.Group();
  const centerX = -5.1;
  const centerY = 4.58;

  const plateau = makeRoundedBox(4.22, 1.92, 0.13, 0.46, MAT.plateau);
  plateau.position.set(centerX, centerY, -0.3);
  put(group, plateau);

  const deckMaterial = new THREE.MeshPhysicalMaterial({
    color: 0x081015,
    metalness: 0.62,
    roughness: 0.14,
    clearcoat: 1,
    clearcoatRoughness: 0.04,
    envMapIntensity: 1.8,
    side: THREE.DoubleSide
  });
  const deckShape = roundedRectShape(4.06, 1.76, 0.4);
  const deck = new THREE.Mesh(new THREE.ShapeGeometry(deckShape, 48), deckMaterial);
  deck.position.set(centerX, centerY, -0.368);
  deck.rotation.y = Math.PI;
  put(group, deck, { noShadow: true, skipPick: true, renderOrder: 2 });

  // Machined trim ring around the camera plateau
  const trimOuter = roundedRectShape(4.26, 1.96, 0.47);
  trimOuter.holes.push(roundedRectShape(4.06, 1.76, 0.4));
  const trim = extrudeShape(trimOuter, 0.016, { bevel: 0.004, curveSegments: 32 });
  trim.material = MAT.frame;
  trim.position.set(centerX, centerY, -0.371);
  put(group, trim);

  const lensPositions = [
    [centerX - 1.08, TEX.lensA],
    [centerX + 0.68, TEX.lensB]
  ];
  for (let i = 0; i < lensPositions.length; i++) {
    const [x, texture] = lensPositions[i];
    const lensGroup = new THREE.Group();
    lensGroup.position.set(x, centerY, -0.364);

    const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.55, 0.575, 0.15, 48), MAT.metal);
    barrel.rotation.x = Math.PI / 2;
    barrel.position.z = -0.045;
    lensGroup.add(barrel);

    const bevel = new THREE.Mesh(new THREE.TorusGeometry(0.49, 0.022, 8, 64), MAT.hingeDark);
    bevel.position.z = -0.124;
    lensGroup.add(bevel);

    const lensMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      color: 0xe9f1f1,
      metalness: 0.4,
      roughness: 0.07,
      emissive: 0x0b1b25,
      emissiveIntensity: 0.42,
      side: THREE.DoubleSide
    });
    const glass = new THREE.Mesh(new THREE.CircleGeometry(0.44, 48), lensMaterial);
    glass.position.z = -0.128;
    glass.rotation.y = Math.PI;
    lensGroup.add(glass);

    for (const [radius, tube, z] of [
      [0.31, 0.014, -0.133],
      [0.205, 0.01, -0.136],
      [0.11, 0.007, -0.138]
    ]) {
      const ring = new THREE.Mesh(new THREE.TorusGeometry(radius, tube, 6, 48), MAT.metal);
      ring.position.z = z;
      lensGroup.add(ring);
    }

    const pupil = new THREE.Mesh(new THREE.CircleGeometry(0.078, 32), MAT.black);
    pupil.position.z = -0.139;
    pupil.rotation.y = Math.PI;
    lensGroup.add(pupil);

    const glint = new THREE.Mesh(
      new THREE.CircleGeometry(0.022, 16),
      new THREE.MeshBasicMaterial({
        color: 0xc9ffff,
        transparent: true,
        opacity: 0.6,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        toneMapped: false
      })
    );
    glint.position.set(-0.14, 0.14, -0.141);
    glint.rotation.y = Math.PI;
    lensGroup.add(glint);

    lensGroup.traverse((child) => {
      if (child.isMesh) {
        child.userData.noShadow = true;
        child.userData.skipPick = true;
      }
    });
    group.add(lensGroup);
  }

  // Flash
  const flashGroup = new THREE.Group();
  flashGroup.position.set(centerX - 0.2, centerY, -0.36);
  const flashRing = new THREE.Mesh(new THREE.TorusGeometry(0.155, 0.024, 8, 48), MAT.metal);
  flashRing.position.z = -0.105;
  flashGroup.add(flashRing);
  const reflector = new THREE.Mesh(new THREE.CircleGeometry(0.14, 40), MAT.metal);
  reflector.position.z = -0.106;
  reflector.rotation.y = Math.PI;
  flashGroup.add(reflector);
  const flash = new THREE.Mesh(new THREE.CircleGeometry(0.095, 32), MAT.flash);
  flash.position.z = -0.109;
  flash.rotation.y = Math.PI;
  flashGroup.add(flash);
  const flashCore = new THREE.Mesh(
    new THREE.CircleGeometry(0.035, 20),
    new THREE.MeshBasicMaterial({ color: 0xfff4d9, toneMapped: false })
  );
  flashCore.position.z = -0.111;
  flashCore.rotation.y = Math.PI;
  flashGroup.add(flashCore);
  flashGroup.traverse((child) => {
    if (child.isMesh) {
      child.userData.noShadow = true;
      child.userData.skipPick = true;
    }
  });
  group.add(flashGroup);

  // Microphone port
  const mic = new THREE.Mesh(new THREE.CircleGeometry(0.036, 24), MAT.screenHole);
  mic.position.set(centerX + 1.72, centerY, -0.37);
  mic.rotation.y = Math.PI;
  put(group, mic, { noShadow: true, skipPick: true });

  // Technical marking on the lower deck
  const plateMaterial = new THREE.MeshBasicMaterial({
    map: TEX.cameraPlate,
    color: 0xa9c0c0,
    transparent: true,
    opacity: 0.72,
    depthWrite: false,
    toneMapped: true
  });
  const plate = new THREE.Mesh(new THREE.PlaneGeometry(2.25, 0.335), plateMaterial);
  plate.position.set(centerX - 0.15, centerY - 0.66, -0.371);
  plate.rotation.y = Math.PI;
  put(group, plate, { noShadow: true, skipPick: true, renderOrder: 3 });

  // Optical bracket hidden behind the deck + data flex
  const bracket = makeRoundedBox(4.3, 2.0, 0.06, 0.16, MAT.graphite);
  bracket.position.set(centerX, centerY, -0.215);
  put(group, bracket, { noShadow: true, skipPick: true });

  const flexCurve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-3.15, 4.05, -0.21),
    new THREE.Vector3(-2.75, 3.55, -0.14),
    new THREE.Vector3(-2.55, 3.15, -0.04),
    new THREE.Vector3(-2.35, 2.85, 0.05)
  ]);
  const flex = makeRibbon(flexCurve, 0.28, MAT.polyimide, 46, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  registerPart('cameraModule', group);
}

function buildOuterFrontCamera() {
  const group = new THREE.Group();
  const x = HALF_X;
  const y = 4.72;

  const punchMaterial = new THREE.MeshBasicMaterial({
    color: 0x010304,
    side: THREE.DoubleSide,
    toneMapped: false
  });
  const punch = new THREE.Mesh(new THREE.CircleGeometry(0.14, 40), punchMaterial);
  punch.position.set(x, y, -0.266);
  punch.rotation.y = Math.PI;
  put(group, punch, { noShadow: true, skipPick: true });

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.2, 32), MAT.hingeDark);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(x, y, -0.18);
  put(group, barrel, { noShadow: true });

  const lensMaterial = new THREE.MeshStandardMaterial({
    map: TEX.lensC,
    color: 0xffffff,
    metalness: 0.35,
    roughness: 0.08,
    emissive: 0x07151e,
    emissiveIntensity: 0.4,
    side: THREE.DoubleSide
  });
  const lens = new THREE.Mesh(new THREE.CircleGeometry(0.105, 40), lensMaterial);
  lens.position.set(x, y, -0.271);
  lens.rotation.y = Math.PI;
  put(group, lens, { noShadow: true, skipPick: true });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.118, 0.012, 6, 40), MAT.metal);
  ring.position.set(x, y, -0.27);
  put(group, ring, { noShadow: true, skipPick: true });

  const flex = makeRibbon(new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, y, -0.16),
    new THREE.Vector3(x + 0.2, y - 0.15, -0.12),
    new THREE.Vector3(x + 0.55, y - 0.25, -0.08)
  ]), 0.18, MAT.polyimide, 28, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  registerPart('outerFrontCamera', group);
}

function buildFaceTimeCamera() {
  const group = new THREE.Group();
  const x = 0.08;
  const y = 4.7;

  const bracket = makeRoundedBox(0.95, 0.34, 0.035, 0.08, MAT.graphite);
  bracket.position.set(x, y, 0.205);
  put(group, bracket, { noShadow: true, skipPick: true });

  const barrel = new THREE.Mesh(new THREE.CylinderGeometry(0.115, 0.125, 0.09, 32), MAT.hingeDark);
  barrel.rotation.x = Math.PI / 2;
  barrel.position.set(x, y, 0.23);
  put(group, barrel, { noShadow: true });

  const aperture = new THREE.Mesh(
    new THREE.CircleGeometry(0.045, 32),
    new THREE.MeshBasicMaterial({
      color: 0x020507,
      transparent: true,
      opacity: 0.55,
      depthWrite: false,
      toneMapped: false
    })
  );
  aperture.position.set(x, y, 0.2565);
  put(group, aperture, { noShadow: true, skipPick: true });

  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.008, 6, 40), MAT.metal);
  ring.position.set(x, y, 0.252);
  put(group, ring, { noShadow: true, skipPick: true });

  const flex = makeRibbon(new THREE.CatmullRomCurve3([
    new THREE.Vector3(x, y - 0.16, 0.21),
    new THREE.Vector3(x - 0.25, y - 0.45, 0.17),
    new THREE.Vector3(x - 0.55, y - 0.68, 0.12)
  ]), 0.2, MAT.polyimide, 26, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  registerPart('faceTimeCamera', group);
}

// ------------------------------------------------------------
// Device — thermal, haptics, audio, port, buttons
// ------------------------------------------------------------

function buildVaporChamber() {
  const group = new THREE.Group();
  const shape = roundedRectShape(5.72, 4.16, 0.3);
  const centerX = -4.25;
  const centerY = 1.08;

  const plate = extrudeShape(shape, 0.028, { bevel: 0.006, curveSegments: 24 });
  plate.material = MAT.copper;
  plate.position.set(centerX, centerY, 0.142);
  put(group, plate);

  const face = texturedShapeMesh(shape, TEX.vapor, {
    color: 0xf1e8df,
    roughness: 0.34,
    metalness: 0.82,
    emissive: 0x2a1106,
    emissiveIntensity: 0.28
  });
  face.position.set(centerX, centerY, 0.157);
  put(group, face);

  const perimeter = new THREE.CatmullRomCurve3([
    new THREE.Vector3(centerX - 2.55, centerY + 1.75, 0.165),
    new THREE.Vector3(centerX + 2.45, centerY + 1.8, 0.165),
    new THREE.Vector3(centerX + 2.65, centerY, 0.165),
    new THREE.Vector3(centerX + 2.45, centerY - 1.8, 0.165),
    new THREE.Vector3(centerX - 2.55, centerY - 1.75, 0.165),
    new THREE.Vector3(centerX - 2.68, centerY, 0.165)
  ], true);
  const pipe = new THREE.Mesh(
    new THREE.TubeGeometry(perimeter, 96, 0.027, 6, true),
    MAT.copper
  );
  pipe.userData.noShadow = true;
  pipe.userData.skipPick = true;
  group.add(pipe);

  addRingZ(group, 0.55, 0.016, MAT.copper, -4.55, 1.72, 0.167, { noShadow: true, skipPick: true });
  addRingZ(group, 0.34, 0.011, MAT.gold, -2.78, 0.48, 0.168, { noShadow: true, skipPick: true });

  const wickMaterial = new THREE.MeshStandardMaterial({
    color: 0x2d3334,
    metalness: 0.55,
    roughness: 0.55
  });
  for (let i = 0; i < 2; i++) {
    const wick = makeRoundedBox(2.1, 0.09, 0.012, 0.02, wickMaterial);
    wick.position.set(centerX + 0.25, centerY - 1.35 + i * 0.5, 0.166);
    put(group, wick, { noShadow: true, skipPick: true });
  }

  const seam = makeRoundedBox(0.035, 3.7, 0.014, 0.01, MAT.gold);
  seam.position.set(-0.14, centerY, 0.166);
  put(group, seam, { noShadow: true, skipPick: true });

  registerPart('vaporChamber', group);
}

function buildTapticEngine() {
  const group = new THREE.Group();
  const x = -1.15;
  const y = -4.9;

  const body = makeRoundedBox(1.48, 1.0, 0.22, 0.18, MAT.hingeDark);
  body.position.set(x, y, -0.015);
  put(group, body);

  const topPlate = makeRoundedBox(1.3, 0.82, 0.035, 0.13, MAT.shield);
  topPlate.position.set(x, y, 0.108);
  put(group, topPlate);

  for (const radius of [0.32, 0.24, 0.16]) {
    addRingZ(group, radius, 0.013, MAT.copper, x, y + 0.03, 0.13, { noShadow: true, skipPick: true });
  }
  const core = makeRoundedBox(0.5, 0.14, 0.03, 0.04, MAT.magnet);
  core.position.set(x, y + 0.03, 0.135);
  put(group, core, { noShadow: true, skipPick: true });

  const labelTexture = createChipTexture('TAPTIC', 'LINEAR RESONANT ACTUATOR', 'silver');
  const labelMaterial = new THREE.MeshStandardMaterial({
    map: labelTexture,
    color: 0xbfc4c2,
    metalness: 0.4,
    roughness: 0.4
  });
  const label = new THREE.Mesh(new THREE.PlaneGeometry(0.4, 0.4), labelMaterial);
  label.position.set(x + 0.42, y - 0.22, 0.128);
  put(group, label, { noShadow: true, skipPick: true });

  const flex = makeRibbon(new THREE.CatmullRomCurve3([
    new THREE.Vector3(x - 0.7, y + 0.2, 0.06),
    new THREE.Vector3(x - 1.05, y + 0.32, 0.08),
    new THREE.Vector3(x - 1.35, y + 0.45, 0.075)
  ]), 0.19, MAT.polyimide, 24, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  registerPart('tapticEngine', group);
}

function buildSpeaker(id, x, y, edgeSign) {
  const group = new THREE.Group();
  const body = makeRoundedBox(2.18, 0.72, 0.21, 0.16, MAT.hingeDark);
  body.position.set(x, y, -0.01);
  put(group, body);

  const chamber = makeRoundedBox(1.82, 0.52, 0.06, 0.12, MAT.graphite);
  chamber.position.set(x, y, 0.105);
  put(group, chamber, { noShadow: true, skipPick: true });

  const cone = new THREE.Mesh(new THREE.CylinderGeometry(0.24, 0.33, 0.07, 32), MAT.rubber);
  cone.rotation.x = Math.PI / 2;
  cone.position.set(x + 0.22, y, 0.125);
  put(group, cone, { noShadow: true, skipPick: true });

  const cap = new THREE.Mesh(new THREE.CircleGeometry(0.13, 28), MAT.metal);
  cap.position.set(x + 0.22, y, 0.162);
  put(group, cap, { noShadow: true, skipPick: true });

  addRingZ(group, 0.355, 0.018, MAT.hingeDark, x + 0.22, y, 0.14, { noShadow: true, skipPick: true });

  const port = makeRoundedBox(1.25, 0.24, 0.16, 0.06, MAT.black);
  port.position.set(x - 0.35, y + edgeSign * 0.32, 0.02);
  put(group, port, { noShadow: true, skipPick: true });

  for (let i = 0; i < 7; i++) {
    const hole = new THREE.Mesh(new THREE.CylinderGeometry(0.027, 0.027, 0.018, 8), MAT.black);
    hole.position.set(x - 0.86 + i * 0.19, y + edgeSign * 0.505, 0.01);
    put(group, hole, { noShadow: true, skipPick: true });
  }

  const gasket = makeRoundedBox(2.0, 0.08, 0.05, 0.02, MAT.rubber);
  gasket.position.set(x, y - edgeSign * 0.33, 0.03);
  put(group, gasket, { noShadow: true, skipPick: true });

  for (const dx of [-0.62, 0.62]) {
    const contact = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.04, 0.012), MAT.gold);
    contact.position.set(x + dx, y - edgeSign * 0.28, 0.19);
    put(group, contact, { noShadow: true, skipPick: true });
  }

  const flex = makeRibbon(new THREE.CatmullRomCurve3([
    new THREE.Vector3(x + 0.75, y + edgeSign * 0.25, 0.08),
    new THREE.Vector3(x + 1.0, y - edgeSign * 0.1, 0.05),
    new THREE.Vector3(x + 1.2, y - edgeSign * 0.36, 0.04)
  ]), 0.18, MAT.polyimide, 22, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  registerPart(id, group);
}

function buildTopSpeaker() {
  buildSpeaker('topSpeaker', -6.1, 5.39, 1);
}

function buildBottomSpeaker() {
  buildSpeaker('bottomSpeaker', 6.1, -5.39, -1);
}

function buildUsbC() {
  const group = new THREE.Group();
  const originX = 4.6;
  const originY = -5.63;
  const local = (x, y, z) => new THREE.Vector3(originX + x, originY + y, z);

  const rear = makeRoundedBox(0.76, 0.5, 0.05, 0.02, MAT.metal);
  rear.position.set(originX, originY, 0.125);
  put(group, rear);

  for (const side of [-1, 1]) {
    const wall = makeRoundedBox(0.08, 0.5, 0.29, 0.025, MAT.metal);
    wall.position.set(originX + side * 0.38, originY, 0);
    put(group, wall);
  }
  for (const side of [-1, 1]) {
    const lip = makeRoundedBox(0.7, 0.5, 0.045, 0.02, MAT.metal);
    lip.position.set(originX, originY, side * 0.1225);
    put(group, lip);
  }

  const cavity = makeRoundedBox(0.68, 0.45, 0.19, 0.04, MAT.black);
  cavity.position.set(originX, originY + 0.025, 0);
  put(group, cavity, { noShadow: true, skipPick: true });

  const tongue = makeRoundedBox(0.55, 0.34, 0.055, 0.02, MAT.hingeDark);
  tongue.position.set(originX, originY - 0.035, 0.015);
  put(group, tongue, { noShadow: true });

  for (let side = -1; side <= 1; side += 2) {
    for (let i = 0; i < 12; i++) {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(0.021, 0.006, 0.018), MAT.gold);
      pin.position.set(originX - 0.23 + i * 0.042, originY - 0.2, 0.015 + side * 0.032);
      put(group, pin, { noShadow: true, skipPick: true });
    }
  }

  const gasket = makeRoundedBox(0.94, 0.07, 0.37, 0.025, MAT.rubber);
  gasket.position.set(originX, originY + 0.19, 0);
  put(group, gasket, { noShadow: true, skipPick: true });

  const flex = makeRibbon(new THREE.CatmullRomCurve3([
    local(0, 0.24, 0.02),
    local(-0.05, 0.48, 0.03),
    local(-0.08, 0.7, 0.035)
  ]), 0.26, MAT.polyimide, 24, new THREE.Vector3(0, 0, 1));
  flex.userData.noShadow = true;
  group.add(flex);

  const pad = makeRoundedBox(0.48, 0.15, 0.025, 0.02, MAT.black);
  pad.position.copy(local(-0.08, 0.72, 0.045));
  put(group, pad, { noShadow: true, skipPick: true });

  registerPart('usbC', group);
}

function buildButtons() {
  const group = new THREE.Group();
  const sideX = HALF_X + HALF_W / 2;

  const addButton = (side, y, height, depth, material = MAT.buttons) => {
    const button = makeRoundedBox(0.09, height, depth, 0.028, material);
    button.position.set(side * (sideX - 0.012), y, 0);
    put(group, button);
    const seam = makeRoundedBox(0.105, height + 0.06, depth + 0.055, 0.018, MAT.rubber);
    seam.position.set(side * (sideX - 0.055), y, 0);
    put(group, seam, { noShadow: true, skipPick: true });
    return button;
  };

  addButton(-1, 2.55, 0.58, 0.23);
  addButton(-1, 1.78, 0.58, 0.23);
  addButton(-1, 3.4, 0.34, 0.16);

  const power = addButton(1, 2.9, 0.82, 0.24);
  power.position.x = sideX - 0.004;

  const cameraControl = addButton(1, 0.82, 0.56, 0.22);
  cameraControl.position.x = sideX - 0.004;

  // Touch ID reader ring on the power key
  const touchRing = new THREE.Mesh(new THREE.TorusGeometry(0.062, 0.012, 6, 40), MAT.gold);
  touchRing.rotation.y = Math.PI / 2;
  touchRing.position.set(sideX + 0.037, 2.9, 0);
  put(group, touchRing, { noShadow: true, skipPick: true });
  const touchPad = new THREE.Mesh(new THREE.CircleGeometry(0.055, 32), MAT.sapphire);
  touchPad.rotation.y = Math.PI / 2;
  touchPad.position.set(sideX + 0.038, 2.9, 0);
  put(group, touchPad, { noShadow: true, skipPick: true });

  // Sapphire Camera Control surface with haptic grooves
  const cameraPad = new THREE.Mesh(new THREE.PlaneGeometry(0.46, 0.17), MAT.sapphire);
  cameraPad.rotation.y = Math.PI / 2;
  cameraPad.position.set(sideX + 0.038, 0.82, 0);
  put(group, cameraPad, { noShadow: true, skipPick: true });
  for (const dz of [-0.045, 0.045]) {
    const groove = new THREE.Mesh(new THREE.BoxGeometry(0.008, 0.115, 0.01), MAT.black);
    groove.position.set(sideX + 0.041, 0.82, dz);
    put(group, groove, { noShadow: true, skipPick: true });
  }

  // FPC tails into the frame
  const tailPoints = [
    new THREE.Vector3(-7.95, 2.2, 0.01),
    new THREE.Vector3(-7.65, 2.35, 0.04),
    new THREE.Vector3(-7.35, 2.5, 0.02)
  ];
  const tail = makeRibbon(new THREE.CatmullRomCurve3(tailPoints), 0.16, MAT.polyimide, 22, new THREE.Vector3(0, 0, 1));
  tail.userData.noShadow = true;
  group.add(tail);

  registerPart('buttons', group);
}

// ------------------------------------------------------------
// Device — interposer and fasteners
// ------------------------------------------------------------

function buildInterposerFlex() {
  const group = new THREE.Group();
  const curve = new THREE.CatmullRomCurve3([
    new THREE.Vector3(-1.9, 1.82, 0.08),
    new THREE.Vector3(-1.25, 1.7, 0.115),
    new THREE.Vector3(-0.7, 1.55, 0.1),
    new THREE.Vector3(-0.25, 1.68, 0.085),
    new THREE.Vector3(0.2, 1.55, 0.09),
    new THREE.Vector3(0.72, 1.7, 0.11),
    new THREE.Vector3(1.28, 1.62, 0.1),
    new THREE.Vector3(1.92, 1.8, 0.08)
  ]);

  const ribbon = makeRibbon(curve, 0.52, MAT.polyimide, 120, new THREE.Vector3(0, 0, 1));
  ribbon.userData.noShadow = true;
  group.add(ribbon);

  for (const offset of [-0.17, -0.085, 0, 0.085, 0.17]) {
    const tracePoints = curve.getPoints(100).map((point) => new THREE.Vector3(point.x, point.y + offset, point.z + 0.005));
    const trace = new THREE.Line(new THREE.BufferGeometry().setFromPoints(tracePoints), lineMaterial(0xe8bb70, 0.72));
    trace.userData.noShadow = true;
    trace.userData.skipPick = true;
    group.add(trace);
  }

  for (const side of [-1, 1]) {
    const connector = makeRoundedBox(0.46, 0.62, 0.04, 0.05, MAT.black);
    connector.position.set(side * 1.92, 1.8, 0.078);
    put(group, connector, { noShadow: true });

    for (let i = 0; i < 6; i++) {
      const contact = new THREE.Mesh(new THREE.BoxGeometry(0.035, 0.028, 0.008), MAT.gold);
      contact.position.set(side * 1.92 - 0.14 + i * 0.056, 1.8, 0.1);
      put(group, contact, { noShadow: true, skipPick: true });
    }
  }

  // Strain relief loops
  for (const side of [-1, 1]) {
    const loop = new THREE.Mesh(new THREE.TorusGeometry(0.14, 0.018, 6, 32, Math.PI), MAT.rubber);
    loop.position.set(side * 1.68, 1.8, 0.075);
    loop.rotation.z = side > 0 ? 0 : Math.PI;
    put(group, loop, { noShadow: true, skipPick: true });
  }

  registerPart('interposerFlex', group);
}

const SCREW_CONFIGS = {
  T4: { radius: 0.062, headHeight: 0.034, shaftRadius: 0.03, shaftLength: 0.16, material: 'steel', recess: 'torx' },
  Y000: { radius: 0.05, headHeight: 0.028, shaftRadius: 0.024, shaftLength: 0.12, material: 'dark', recess: 'tri' },
  P2: { radius: 0.054, headHeight: 0.03, shaftRadius: 0.025, shaftLength: 0.13, material: 'black', recess: 'penta' },
  PH00: { radius: 0.052, headHeight: 0.028, shaftRadius: 0.024, shaftLength: 0.12, material: 'steel', recess: 'cross' },
  HEX: { radius: 0.073, headHeight: 0.038, shaftRadius: 0.034, shaftLength: 0.18, material: 'dark', recess: 'hex' }
};

const screwAssetCache = new Map();

function getScrewAssets(type) {
  if (screwAssetCache.has(type)) return screwAssetCache.get(type);
  const config = SCREW_CONFIGS[type];
  const material = config.material === 'steel'
    ? MAT.screwSteel
    : (config.material === 'black' ? MAT.screwBlack : MAT.screwDark);

  let recessGeometry;
  if (config.recess === 'torx') {
    recessGeometry = new THREE.ExtrudeGeometry(starShape(6, 0.024, 0.0125, Math.PI / 6), { depth: 0.004, bevelEnabled: false });
  } else if (config.recess === 'tri') {
    recessGeometry = new THREE.ExtrudeGeometry(starShape(3, 0.022, 0.009), { depth: 0.004, bevelEnabled: false });
  } else if (config.recess === 'penta') {
    recessGeometry = new THREE.ExtrudeGeometry(starShape(5, 0.021, 0.009, Math.PI / 2), { depth: 0.004, bevelEnabled: false });
  } else if (config.recess === 'cross') {
    recessGeometry = new THREE.ExtrudeGeometry(plusShape(0.023, 0.0072), { depth: 0.004, bevelEnabled: false });
  } else {
    recessGeometry = new THREE.CylinderGeometry(0.026, 0.026, 0.006, 6);
  }

  const assets = {
    config,
    material,
    headGeometry: new THREE.CylinderGeometry(config.radius * 0.92, config.radius, config.headHeight, 16),
    shaftGeometry: new THREE.CylinderGeometry(config.shaftRadius, config.shaftRadius * 0.76, config.shaftLength, 10),
    threadGeometry: new THREE.TorusGeometry(config.shaftRadius * 1.16, 0.0045, 4, 12),
    chamferGeometry: new THREE.TorusGeometry(config.radius * 0.84, 0.0045, 4, 20),
    recessGeometry,
    recessMaterial: MAT.screwBlack
  };
  screwAssetCache.set(type, assets);
  return assets;
}

function createScrew(type) {
  const assets = getScrewAssets(type);
  const config = assets.config;
  const group = new THREE.Group();

  const head = new THREE.Mesh(assets.headGeometry, assets.material);
  head.rotation.x = Math.PI / 2;
  head.position.z = config.headHeight / 2;
  head.userData.noShadow = true;
  group.add(head);

  const shaft = new THREE.Mesh(assets.shaftGeometry, assets.material);
  shaft.rotation.x = Math.PI / 2;
  shaft.position.z = -config.shaftLength / 2;
  shaft.userData.noShadow = true;
  group.add(shaft);

  for (let i = 0; i < 2; i++) {
    const thread = new THREE.Mesh(assets.threadGeometry, assets.material);
    thread.position.z = -config.shaftLength * (0.32 + i * 0.38);
    thread.userData.noShadow = true;
    group.add(thread);
  }

  const chamfer = new THREE.Mesh(assets.chamferGeometry, assets.material);
  chamfer.position.z = config.headHeight - 0.001;
  chamfer.userData.noShadow = true;
  group.add(chamfer);

  if (config.recess === 'hex') {
    const socket = new THREE.Mesh(assets.recessGeometry, assets.recessMaterial);
    socket.rotation.x = Math.PI / 2;
    socket.position.z = config.headHeight + 0.0005;
    socket.userData.noShadow = true;
    group.add(socket);
  } else {
    const recess = new THREE.Mesh(assets.recessGeometry, assets.recessMaterial);
    recess.position.z = config.headHeight + 0.0004;
    recess.userData.noShadow = true;
    group.add(recess);
  }

  group.userData.screwType = type;
  return group;
}

function buildScrews() {
  const group = new THREE.Group();
  const T4 = [
    [-7.15, 4.72, 0.105, 1], [-7.15, -4.72, 0.105, 1], [-0.62, 4.72, 0.105, 1], [-0.62, -4.72, 0.105, 1],
    [-6.95, 3.35, 0.075, 1], [-6.95, 1.2, 0.075, 1], [-6.95, -1.5, 0.075, 1], [-6.95, -3.3, 0.075, 1],
    [-0.82, 3.35, 0.075, 1], [-0.82, 1.2, 0.075, 1], [-0.82, -1.5, 0.075, 1], [-0.82, -3.3, 0.075, 1],
    [-3.4, 5.32, 0.075, 1], [-3.4, -5.34, 0.075, 1], [0.95, 5.32, 0.075, 1], [0.95, -5.34, 0.075, 1],
    [0, -5.48, -0.16, -1], [0, 5.48, -0.16, -1]
  ];
  const Y000 = [
    [6.92, 4.7, 0.16, 1], [6.92, 3.1, 0.16, 1], [6.92, 1.5, 0.16, 1], [6.92, -0.1, 0.16, 1], [6.92, -1.7, 0.16, 1], [6.92, -4.7, 0.16, 1],
    [1.3, 4.7, 0.16, 1], [1.3, 3.1, 0.16, 1], [1.3, -1.2, 0.16, 1], [1.3, -4.7, 0.16, 1],
    [3.0, -4.45, 0.075, 1], [4.4, -4.45, 0.075, 1], [5.8, -4.45, 0.075, 1],
    [2.5, 2.75, 0.075, 1], [4.1, 2.75, 0.075, 1], [5.7, 2.75, 0.075, 1],
    [2.7, -3.2, 0.075, 1], [5.9, -3.2, 0.075, 1]
  ];
  const P2 = [
    [-6.95, 5.3, -0.22, -1], [-3.3, 5.3, -0.22, -1],
    [-6.95, 3.86, -0.22, -1], [-3.3, 3.86, -0.22, -1]
  ];
  const PH00 = [
    [-3.25, 1.1, 0.085, 1], [-2.45, 1.1, 0.085, 1], [-1.65, 1.1, 0.085, 1],
    [4.7, -5.16, 0.085, 1], [5.4, -5.16, 0.085, 1]
  ];
  const HEX = [
    [-1.7, -4.9, 0.105, 1], [-0.6, -4.9, 0.105, 1]
  ];

  const plan = [
    ...T4.map((entry) => ['T4', ...entry]),
    ...Y000.map((entry) => ['Y000', ...entry]),
    ...P2.map((entry) => ['P2', ...entry]),
    ...PH00.map((entry) => ['PH00', ...entry]),
    ...HEX.map((entry) => ['HEX', ...entry])
  ];

  const random = seededRandom(4701);
  for (let index = 0; index < plan.length; index++) {
    const [type, x, y, z, facing] = plan[index];
    const screw = createScrew(type);
    screw.position.set(x, y, z);
    screw.rotation.y = facing > 0 ? 0 : Math.PI;
    screw.rotation.z = random() * Math.PI * 2;
    group.add(screw);

    const spin = new THREE.Vector3(
      (random() - 0.5) * 3.2,
      (random() - 0.5) * 2.2,
      (random() - 0.5) * 3
    );
    screwRecords.push({
      group: screw,
      base: new THREE.Vector3(x, y, z),
      baseRotation: screw.rotation.clone(),
      scatter: new THREE.Vector3(
        (random() - 0.5) * 1.9,
        (random() - 0.5) * 1.9,
        facing * (0.65 + random() * 1.55)
      ),
      spin,
      delay: 0.29 + random() * 0.19,
      phase: random() * Math.PI * 2
    });
  }

  registerPart('screws', group);
}

// ------------------------------------------------------------
// Assemble the device
// ------------------------------------------------------------

function buildDevice() {
  device = new THREE.Group();
  device.position.set(0, 0.1, 0);
  scene.add(device);

  buildInnerDisplay();
  buildCoverLayer();
  buildDisplayPlate();
  buildOuterDisplay();
  buildBackGlass();
  buildEnclosure();
  buildHinge();
  buildLogicBoard();
  buildIoBoard();
  buildBattery1();
  buildBattery2();
  buildCameraModule();
  buildOuterFrontCamera();
  buildFaceTimeCamera();
  buildVaporChamber();
  buildTapticEngine();
  buildTopSpeaker();
  buildBottomSpeaker();
  buildUsbC();
  buildButtons();
  buildInterposerFlex();
  buildScrews();

  buildSelectionSprite();
}

// ------------------------------------------------------------
// DOM references and shared UI state
// ------------------------------------------------------------

const stage = $('#stage');
const leaderSvg = $('#leaderSvg');
const partsPanel = $('#partsPanel');
const partsToggle = $('#partsToggle');
const inspector = $('#inspector');
const labelLayer = $('#labelLayer');

// ------------------------------------------------------------
// Explosion / teardown animation
// ------------------------------------------------------------

function applyExplosionPositions(delta) {
  const current = state.explodeCurrent;
  const liftK = 1 - Math.pow(0.002, delta);
  for (const entry of parts.values()) {
    const data = entry.data;
    const spread = Math.max(0.1, 1 - data.delay * 0.9);
    const p = easeOutCubic(clamp((current - data.delay * 0.9) / spread, 0, 1));
    const amount = p * current;
    entry.progress = amount;
    entry.lift += ((entry.targetLift || 0) - entry.lift) * liftK;
    entry.group.position
      .copy(entry.base)
      .addScaledVector(entry.explodeDir, amount * entry.explodeLen)
      .addScaledVector(entry.explodeDir, entry.lift * 0.26);
  }

  const scatter = easeOutCubic(clamp((current - 0.82) / 0.18, 0, 1));
  for (const record of screwRecords) {
    record.group.position.set(
      record.base.x + record.scatter.x * scatter,
      record.base.y + record.scatter.y * scatter,
      record.base.z + record.scatter.z * scatter
    );
    record.group.rotation.set(
      record.baseRotation.x + record.spin.x * scatter,
      record.baseRotation.y + record.spin.y * scatter,
      record.baseRotation.z + record.spin.z * scatter
    );
  }
}

function setExplode(value, { silent = false } = {}) {
  const clamped = Math.round(clamp(value, 0, 100));
  state.explodeTarget = clamped / 100;
  const range = $('#explodeRange');
  const percent = $('#explodePercent');
  const button = $('#explodeBtn');
  const label = $('#explodeBtnLabel');
  if (range) {
    range.value = String(clamped);
    range.style.setProperty('--fill', `${clamped}%`);
  }
  if (percent) percent.textContent = `${String(clamped).padStart(2, '0')}%`;
  const active = clamped >= 99.5;
  if (button) {
    button.classList.toggle('is-active', active);
    button.setAttribute('aria-pressed', String(active));
  }
  if (label) label.textContent = clamped === 0 ? '展开拆解' : (active ? '收合整机' : '拆解中…');
  updateModeLabel();
  if (!silent) {
    setAutoRotate(clamped === 0 && state.autoRotate, true);
  }
}

function toggleExplode() {
  const opening = state.explodeTarget < 0.5;
  setExplode(opening ? 100 : 0);
  toast(opening ? '已展开拆解视图 — 拖拽滑杆可控制分离程度' : '已收合整机');
  announce(opening ? '拆解视图已展开，47 颗紧固件将依次散落。' : '整机已收合。');
}

// ------------------------------------------------------------
// Labels and leaders
// ------------------------------------------------------------

const LABEL_W = 168;
const LABEL_H = 64;

function buildLabels() {
  const layer = $('#labelLayer');
  const group = $('#leaderGroup');
  const svgNs = 'http://www.w3.org/2000/svg';

  for (const data of PART_DATA) {
    const el = document.createElement('button');
    el.type = 'button';
    el.className = 'part-label';
    el.dataset.part = data.id;
    el.setAttribute('aria-label', `查看${data.name}`);
    el.innerHTML = `
      <span class="part-label__top">
        <span class="part-label__index">${data.no}</span>
        <span class="part-label__category">${CATEGORIES[data.category].short}</span>
      </span>
      <span class="part-label__name">${data.name}</span>
      <span class="part-label__spec">${data.spec}</span>`;
    el.addEventListener('click', () => selectPart(data.id));
    layer.appendChild(el);

    const g = document.createElementNS(svgNs, 'g');
    g.setAttribute('class', 'leader-group');
    g.dataset.part = data.id;
    const path = document.createElementNS(svgNs, 'path');
    path.setAttribute('class', 'leader-line');
    const anchor = document.createElementNS(svgNs, 'circle');
    anchor.setAttribute('class', 'leader-anchor');
    anchor.setAttribute('r', '3');
    const core = document.createElementNS(svgNs, 'circle');
    core.setAttribute('class', 'leader-anchor-core');
    core.setAttribute('r', '1.4');
    g.append(path, anchor, core);
    group.appendChild(g);

    labelMap.set(data.id, { el, data, leader: { g, path, anchor, core }, visible: false });
  }
}

function projectToStage(vector) {
  projectVector.copy(vector).project(camera);
  return {
    x: (projectVector.x * 0.5 + 0.5) * stage.clientWidth,
    y: (-projectVector.y * 0.5 + 0.5) * stage.clientHeight,
    z: projectVector.z
  };
}

function rectsOverlap(a, b) {
  return !(a.x + a.w <= b.x || b.x + b.w <= a.x || a.y + a.h <= b.y || b.y + b.h <= a.y);
}

function updateLabelsAndLeaders() {
  if (!stage || !camera) return;
  const width = stage.clientWidth;
  const height = stage.clientHeight;
  const mobile = isMobileLayout();
  const padLeft = mobile ? 10 : 302;
  const padRight = mobile ? 10 : 344;
  const padTop = mobile ? 12 : 96;
  const padBottom = mobile ? 12 : 128;
  const exploded = state.explodeCurrent > 0.05;

  const anchorWorld = new THREE.Vector3();
  const candidates = [];
  for (const [id, rec] of labelMap) {
    const part = parts.get(id);
    if (!part) continue;
    anchorWorld.set(...rec.data.anchor).add(part.group.position);
    const screen = projectToStage(anchorWorld);
    const inFront = screen.z < 1;
    const inside = screen.x > -60 && screen.x < width + 60 && screen.y > -60 && screen.y < height + 60;
    const show = inFront && inside && (
      exploded || id === state.selectedId || id === state.hoveredId || rec.data.priority >= 8
    );
    rec.visible = show;
    candidates.push({ ...screen, id, rec });
  }

  candidates.sort((a, b) => (Number(b.rec.visible) - Number(a.rec.visible)) || (b.rec.data.priority - a.rec.data.priority));
  placedLabelRects.length = 0;

  for (const candidate of candidates) {
    const { rec, id } = candidate;
    const el = rec.el;
    const leader = rec.leader;
    if (!rec.visible) {
      el.classList.remove('is-visible');
      leader.g.classList.remove('is-visible');
      continue;
    }

    const w = el.offsetWidth || LABEL_W;
    const h = el.offsetHeight || LABEL_H;
    let side = candidate.x < width * 0.55 ? 1 : -1;

    const tryPlace = (dir) => {
      const gap = 18;
      const x = dir > 0 ? candidate.x + gap : candidate.x - gap - w;
      for (let attempt = 0; attempt <= 14; attempt++) {
        const offset = attempt === 0 ? 0 : Math.ceil(attempt / 2) * (h + 10) * (attempt % 2 ? -1 : 1);
        const y = clamp(candidate.y - h / 2 + offset, padTop, height - h - padBottom);
        const rect = { x, y, w, h };
        if (x < padLeft || x + w > width - padRight) continue;
        if (!placedLabelRects.some((r) => rectsOverlap(r, rect))) return { x, y, dir };
      }
      return null;
    };

    let placed = tryPlace(side);
    if (!placed) placed = tryPlace(-side);
    if (!placed) {
      placed = {
        x: side > 0 ? Math.min(candidate.x + 18, width - w - padRight) : Math.max(candidate.x - 18 - w, padLeft),
        y: clamp(candidate.y - h / 2, padTop, height - h - padBottom),
        dir: side
      };
    }

    el.classList.toggle('is-left', placed.dir < 0);
    el.classList.toggle('is-selected', id === state.selectedId);
    el.style.transform = `translate3d(${placed.x}px, ${placed.y}px, 0)`;
    el.classList.add('is-visible');
    leader.g.classList.add('is-visible');

    const labelEdge = placed.dir > 0 ? placed.x : placed.x + w;
    const targetY = clamp(placed.y + h / 2, padTop + 4, height - padBottom - 4);
    const midX = (candidate.x + labelEdge) / 2;
    leader.path.setAttribute('d', `M ${candidate.x} ${candidate.y} L ${midX} ${candidate.y} L ${midX} ${targetY} L ${labelEdge} ${targetY}`);
    leader.anchor.setAttribute('cx', candidate.x);
    leader.anchor.setAttribute('cy', candidate.y);
    leader.core.setAttribute('cx', candidate.x);
    leader.core.setAttribute('cy', candidate.y);
    leader.path.classList.toggle('is-selected', id === state.selectedId);

    placedLabelRects.push({ x: placed.x, y: placed.y, w, h });
  }

  leaderSvg.setAttribute('width', width);
  leaderSvg.setAttribute('height', height);
  leaderSvg.setAttribute('viewBox', `0 0 ${width} ${height}`);

  updateDimensionLabels(width, height, padLeft, padRight, padTop, padBottom);
}

function updateDimensionLabels(width, height, padLeft, padRight, padTop, padBottom) {
  if (!state.dimensions) return;
  for (const entry of dimensionLabels) {
    const mid = new THREE.Vector3().addVectors(entry.a, entry.b).multiplyScalar(0.5);
    const screen = projectToStage(mid);
    if (screen.z >= 1) {
      entry.el.classList.remove('is-visible');
      continue;
    }
    const x = clamp(screen.x + 12, padLeft + 4, width - padRight - 84);
    const y = clamp(screen.y - 26, padTop + 4, height - padBottom - 14);
    entry.el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    entry.el.classList.add('is-visible');
  }
}

// ------------------------------------------------------------
// 3D dimension lines
// ------------------------------------------------------------

function buildDimensions() {
  dimensionsGroup = new THREE.Group();
  dimensionsGroup.visible = false;
  const mat = lineMaterial(0x7af7df, 0.42);
  const tickMat = lineMaterial(0x7af7df, 0.28);
  const v = (x, y, z) => new THREE.Vector3(x, y, z);
  const add = (points, material) => {
    const line = segment(points, material);
    line.userData.noShadow = true;
    line.userData.skipPick = true;
    dimensionsGroup.add(line);
    return line;
  };

  // Width
  const wY = H / 2 + 1.35;
  const wX0 = -W / 2 - 1.05;
  const wX1 = W / 2 + 1.05;
  dimensionLabels.push({ key: 'W', a: v(wX0, wY, 0), b: v(wX1, wY, 0), el: null });
  add([v(wX0, wY, 0), v(wX1, wY, 0)], mat);
  for (const x of [wX0, wX1]) add([v(x, wY - 0.15, 0), v(x, wY + 0.15, 0)], tickMat);
  const ah = 0.2;
  add([v(wX0, wY, 0), v(wX0 + ah, wY + ah * 0.6, 0)], mat);
  add([v(wX0, wY, 0), v(wX0 + ah, wY - ah * 0.6, 0)], mat);
  add([v(wX1, wY, 0), v(wX1 - ah, wY + ah * 0.6, 0)], mat);
  add([v(wX1, wY, 0), v(wX1 - ah, wY - ah * 0.6, 0)], mat);

  // Height
  const hX = -W / 2 - 1.5;
  const hY0 = -H / 2 - 0.95;
  const hY1 = H / 2 + 0.95;
  dimensionLabels.push({ key: 'H', a: v(hX, hY0, 0), b: v(hX, hY1, 0), el: null });
  add([v(hX, hY0, 0), v(hX, hY1, 0)], mat);
  for (const y of [hY0, hY1]) add([v(hX - 0.15, y, 0), v(hX + 0.15, y, 0)], tickMat);
  add([v(hX, hY0, 0), v(hX + ah * 0.6, hY0 + ah, 0)], mat);
  add([v(hX, hY0, 0), v(hX - ah * 0.6, hY0 + ah, 0)], mat);
  add([v(hX, hY1, 0), v(hX + ah * 0.6, hY1 - ah, 0)], mat);
  add([v(hX, hY1, 0), v(hX - ah * 0.6, hY1 - ah, 0)], mat);

  // Thickness (Z) at the lower-right corner with endpoint markers
  const dX = W / 2 + 1.5;
  const dY = -H / 2 - 1.4;
  const dZ0 = -0.66;
  const dZ1 = 0.78;
  dimensionLabels.push({ key: 'D', a: v(dX, dY, dZ0), b: v(dX, dY, dZ1), el: null });
  add([v(dX, dY, dZ0), v(dX, dY, dZ1)], mat);
  for (const z of [dZ0, dZ1]) add([v(dX - 0.15, dY, z), v(dX + 0.15, dY, z)], tickMat);
  const markerMat = new THREE.MeshBasicMaterial({ color: 0x7af7df, transparent: true, opacity: 0.75, toneMapped: false });
  for (const z of [dZ0, dZ1]) {
    const marker = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.013, 4, 16), markerMat);
    marker.position.set(dX, dY, z);
    marker.userData.noShadow = true;
    marker.userData.skipPick = true;
    dimensionsGroup.add(marker);
  }

  scene.add(dimensionsGroup);

  const texts = { W: 'W 164.6 MM', H: 'H 117.8 MM', D: 'D 5.2 MM' };
  for (const entry of dimensionLabels) {
    const el = document.createElement('div');
    el.className = 'dimension-label';
    el.textContent = texts[entry.key];
    labelLayer.appendChild(el);
    entry.el = el;
  }
}

function toggleDimensions(force) {
  state.dimensions = typeof force === 'boolean' ? force : !state.dimensions;
  if (dimensionsGroup) dimensionsGroup.visible = state.dimensions;
  const button = $('#dimensionBtn');
  if (button) {
    button.classList.toggle('is-active', state.dimensions);
    button.setAttribute('aria-pressed', String(state.dimensions));
  }
  if (!state.dimensions) {
    for (const entry of dimensionLabels) entry.el.classList.remove('is-visible');
  }
  announce(state.dimensions ? '官方尺寸标注已显示：宽 164.6 毫米，高 117.8 毫米，厚 5.2 毫米。' : '尺寸标注已隐藏。');
}

// ------------------------------------------------------------
// Selection and inspector
// ------------------------------------------------------------

function selectPart(id, { fly = false } = {}) {
  if (id && !parts.has(id)) id = null;
  state.selectedId = id;
  clearSelectionMaterials();
  if (id) applySelectionMaterials(id);
  if (selectionSprite) selectionSprite.visible = Boolean(id);

  for (const entry of parts.values()) entry.targetLift = entry.id === id ? 1 : 0;

  updatePartListSelection();
  updateInspector(id);

  if (id) {
    setAutoRotate(false, true);
    if (fly) focusPart(id);
    if (isMobileLayout() && !inspector.classList.contains('is-open')) openDrawer('inspector');
  } else if (isMobileLayout() && inspector.classList.contains('is-open')) {
    closeDrawers();
  }
}

function updatePartListSelection() {
  $$('.part-row').forEach((row) => row.classList.toggle('is-selected', row.dataset.part === state.selectedId));
  if (state.selectedId) {
    const row = $(`.part-row[data-part="${state.selectedId}"]`);
    if (row && isMobileLayout()) row.scrollIntoView({ block: 'nearest' });
  }
}

function updateInspector(id) {
  const def = $('#inspectorDefault');
  const detail = $('#inspectorDetail');
  if (!id) {
    def.hidden = false;
    detail.hidden = true;
    return;
  }
  const data = parts.get(id).data;
  def.hidden = true;
  detail.hidden = false;
  $('#detailEyebrow').textContent = `MODULE ${data.no} / ${CATEGORIES[data.category].short}`;
  $('#detailName').textContent = data.name;
  $('#detailEn').textContent = data.en;
  $('#detailIndex').textContent = data.no;
  $('#detailCategory').textContent = CATEGORIES[data.category].label;
  $('#detailPartNo').textContent = data.partNo;
  $('#detailSpecs').innerHTML = data.specs
    .map(([key, value]) => `<div class="detail-spec"><span>${key}</span><strong>${value}</strong></div>`)
    .join('');
  $('#detailDescription').textContent = data.desc;
  $('#detailRepair').textContent = data.repair;
}

// ------------------------------------------------------------
// Parts list panel
// ------------------------------------------------------------

let partFilter = 'all';
let partQuery = '';

function buildPartList() {
  const list = $('#partList');
  list.innerHTML = '';
  for (const data of PART_DATA) {
    const row = document.createElement('button');
    row.type = 'button';
    row.className = 'part-row';
    row.dataset.part = data.id;
    row.setAttribute('role', 'option');
    row.style.setProperty('--cat-color', CATEGORIES[data.category].color);
    row.innerHTML = `
      <span class="part-row__index">${data.no}</span>
      <span class="part-row__main">
        <span class="part-row__name">${data.name}<em>${data.partNo}</em></span>
        <span class="part-row__meta"><i></i>${CATEGORIES[data.category].label} · ${data.spec}</span>
      </span>
      <span class="part-row__status"></span>`;
    row.addEventListener('click', () => selectPart(data.id, { fly: true }));
    list.appendChild(row);
  }
  applyPartFilter();
}

function applyPartFilter() {
  const rows = $$('.part-row');
  let visible = 0;
  for (const row of rows) {
    const data = PART_DATA.find((item) => item.id === row.dataset.part);
    const matchCategory = partFilter === 'all' || data.category === partFilter;
    const query = partQuery.trim().toLowerCase();
    const matchQuery = !query ||
      data.name.toLowerCase().includes(query) ||
      data.en.toLowerCase().includes(query) ||
      data.partNo.toLowerCase().includes(query) ||
      data.no === query;
    const show = matchCategory && matchQuery;
    row.hidden = !show;
    if (show) visible++;
  }
  let empty = $('.part-list__empty');
  if (visible === 0) {
    if (!empty) {
      empty = document.createElement('div');
      empty.className = 'part-list__empty';
      empty.textContent = 'NO MATCH\n未找到匹配部件';
      $('#partList').appendChild(empty);
    }
    empty.hidden = false;
  } else if (empty) {
    empty.hidden = true;
  }
}

// ------------------------------------------------------------
// Drawers and modals
// ------------------------------------------------------------

function openDrawer(which) {
  closeDrawers();
  const scrim = $('#drawerScrim');
  if (which === 'parts') {
    partsPanel.classList.add('is-open');
    partsToggle.setAttribute('aria-expanded', 'true');
  } else if (which === 'inspector') {
    inspector.classList.add('is-open');
  }
  scrim.classList.add('is-open');
}

function closeDrawers() {
  partsPanel.classList.remove('is-open');
  inspector.classList.remove('is-open');
  $('#drawerScrim').classList.remove('is-open');
  partsToggle.setAttribute('aria-expanded', 'false');
}

function togglePartsPanel() {
  if (isMobileLayout()) {
    if (partsPanel.classList.contains('is-open')) closeDrawers();
    else openDrawer('parts');
  } else {
    document.body.classList.toggle('parts-hidden');
    partsToggle.classList.toggle('is-active', document.body.classList.contains('parts-hidden'));
    partsToggle.setAttribute('aria-expanded', String(!document.body.classList.contains('parts-hidden')));
  }
}

function openModal(id) {
  modalReturnFocus = document.activeElement;
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.hidden = false;
  const focusTarget = modal.querySelector('button, a, input');
  if (focusTarget) setTimeout(() => focusTarget.focus(), 60);
}

function closeModal(id) {
  const modal = $(`#${id}`);
  if (!modal) return;
  modal.hidden = true;
  if (modalReturnFocus && modalReturnFocus.focus) modalReturnFocus.focus();
  modalReturnFocus = null;
}

function closeTopLayer() {
  const helpModal = $('#helpModal');
  const cameraModal = $('#cameraModal');
  if (helpModal && !helpModal.hidden) { closeModal('helpModal'); return; }
  if (cameraModal && !cameraModal.hidden) { closeModal('cameraModal'); return; }
  if (isMobileLayout() && (partsPanel.classList.contains('is-open') || inspector.classList.contains('is-open'))) {
    closeDrawers();
    return;
  }
  if (state.selectedId) { selectPart(null); return; }
  if (state.explodeTarget > 0.01) { setExplode(0); return; }
}

// ------------------------------------------------------------
// Camera integration
// ------------------------------------------------------------

let cameraStream = null;

async function startCamera(facing = 'environment') {
  if (cameraStream) stopCamera();
  const errorEl = $('#cameraError');
  if (errorEl) errorEl.textContent = '';
  if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
    if (errorEl) errorEl.textContent = '当前环境不支持摄像头 API。请使用 HTTPS 或 localhost 打开页面。';
    return;
  }
  try {
    cameraStream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: facing, width: { ideal: 1280 }, height: { ideal: 720 } },
      audio: false
    });
  } catch (error) {
    if (errorEl) {
      errorEl.textContent = error && error.name === 'NotAllowedError'
        ? '权限被拒绝。请在浏览器地址栏允许摄像头访问后重试。'
        : `无法打开摄像头：${error ? error.message : '未知错误'}`;
    }
    return;
  }
  const feed = $('#cameraFeed');
  feed.srcObject = cameraStream;
  try { await feed.play(); } catch (error) { /* autoplay already granted by attributes */ }
  state.cameraOn = true;
  document.body.classList.add('camera-on');
  $('#cameraBadge').setAttribute('aria-hidden', 'false');
  $('#cameraBtn').classList.add('is-active');
  closeModal('cameraModal');
  updateRenderModeLabel();
  toast('实景摄像头已接入 — 画面仅在本机处理');
  announce('摄像头已开启，拆解模型已叠合到实时画面上。');
}

function stopCamera() {
  if (cameraStream) {
    cameraStream.getTracks().forEach((track) => track.stop());
    cameraStream = null;
  }
  const feed = $('#cameraFeed');
  if (feed) feed.srcObject = null;
  state.cameraOn = false;
  document.body.classList.remove('camera-on');
  $('#cameraBadge').setAttribute('aria-hidden', 'true');
  $('#cameraBtn').classList.remove('is-active');
  updateRenderModeLabel();
}

// ------------------------------------------------------------
// HUD helpers
// ------------------------------------------------------------

function setAutoRotate(value, silent = false) {
  state.autoRotate = value;
  if (controls) controls.autoRotate = value;
  if (!silent) {
    const button = $('#autorotateBtn');
    if (button) {
      button.classList.toggle('is-active', value);
      button.setAttribute('aria-pressed', String(value));
    }
  }
}

function updateModeLabel() {
  let text = 'ASSEMBLED / 整机状态';
  if (state.xray) text = 'X-RAY / 透视模式';
  if (state.explodeTarget >= 0.999) text = 'EXPLODED / 拆解视图';
  else if (state.explodeTarget > 0.03) text = 'TEARDOWN / 分层视图';
  if (text !== lastModeText) {
    lastModeText = text;
    const label = $('#modeLabel');
    if (label) label.textContent = text;
  }
}

function updateRenderModeLabel() {
  const partsLabel = state.xray ? 'X-RAY' : 'PBR';
  const sourceLabel = state.cameraOn ? 'CAM-OVERLAY' : 'PROCEDURAL';
  const label = $('#renderModeLabel');
  if (label) label.textContent = `${partsLabel} / ${sourceLabel}`;
}

function announce(message) {
  const el = $('#screenReaderStatus');
  if (!el) return;
  el.textContent = '';
  requestAnimationFrame(() => { el.textContent = message; });
}

function resetView() {
  selectPart(null);
  setExplode(0, { silent: true });
  setView('front', true);
  setAutoRotate(true);
  toast('视图与拆解状态已重置');
}

function updateGizmo(elapsed) {
  if (elapsed - gizmoTick < 0.12 || !controls || !camera) return;
  gizmoTick = elapsed;
  const canvasEl = $('#axisCanvas');
  const ctx = canvasEl.getContext('2d');
  const size = canvasEl.width;
  const cx = size / 2;
  const cy = size / 2;
  const radius = 38;
  ctx.clearRect(0, 0, size, size);

  const camDir = new THREE.Vector3().subVectors(controls.target, camera.position).normalize();
  const right = new THREE.Vector3().crossVectors(camDir, new THREE.Vector3(0, 1, 0));
  if (right.lengthSq() < 0.001) right.set(1, 0, 0);
  right.normalize();
  const up = new THREE.Vector3().crossVectors(right, camDir).normalize();

  const axes = [
    { v: new THREE.Vector3(1, 0, 0), color: '#ff7d87', label: 'X' },
    { v: new THREE.Vector3(0, 1, 0), color: '#8dff9a', label: 'Y' },
    { v: new THREE.Vector3(0, 0, 1), color: '#8fb4ff', label: 'Z' }
  ];
  for (const axis of axes) {
    const dx = axis.v.dot(right);
    const dy = axis.v.dot(up);
    const x = cx + dx * radius;
    const y = cy - dy * radius;
    ctx.strokeStyle = axis.color;
    ctx.globalAlpha = 0.92;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.lineTo(x, y);
    ctx.stroke();
    ctx.globalAlpha = 1;
    ctx.fillStyle = axis.color;
    ctx.font = '10px SFMono-Regular, Menlo, monospace';
    ctx.fillText(axis.label, cx + dx * (radius + 12) - 3, cy - dy * (radius + 12) + 3);
  }
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = '#9ad3e4';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function updateStageReadout() {
  if (!camera) return;
  const now = performance.now();
  if (now - stageReadoutTimer < 240) return;
  stageReadoutTimer = now;
  readoutPoint.set(0, 0.15, 0).project(camera);
  const x = ((readoutPoint.x * 0.5 + 0.5) * 100);
  const y = ((-readoutPoint.y * 0.5 + 0.5) * 100);
  const el = $('.stage-foot__coords');
  if (el) el.textContent = `x ${x.toFixed(2)} · y ${y.toFixed(2)}`;
}

// ------------------------------------------------------------
// Pointer interaction
// ------------------------------------------------------------

function getPointerNdc(event) {
  const rect = renderer.domElement.getBoundingClientRect();
  return new THREE.Vector2(
    ((event.clientX - rect.left) / rect.width) * 2 - 1,
    -((event.clientY - rect.top) / rect.height) * 2 + 1
  );
}

function pickAt(event, { fly = false } = {}) {
  pointerNdc.copy(getPointerNdc(event));
  raycaster.setFromCamera(pointerNdc, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  for (const hit of hits) {
    const partId = hit.object.userData.partId;
    if (partId && parts.has(partId)) {
      selectPart(partId, { fly });
      return;
    }
  }
  selectPart(null);
}

function onPointerDown(event) {
  if (cameraTween) cancelCameraTween();
  pointerNdc.copy(getPointerNdc(event));
  pointerState.downX = event.clientX;
  pointerState.downY = event.clientY;
  pointerState.downTime = performance.now();
  pointerState.moved = false;
}

function onPointerMove(event) {
  pointerNdc.copy(getPointerNdc(event));
  if (pointerState.downTime) {
    const dx = event.clientX - pointerState.downX;
    const dy = event.clientY - pointerState.downY;
    if (dx * dx + dy * dy > 49) pointerState.moved = true;
  }
  const now = performance.now();
  if (now - pointerState.lastHoverCheck < 90) return;
  pointerState.lastHoverCheck = now;
  if (pointerState.moved) {
    if (state.hoveredId) { state.hoveredId = null; hideHoverTag(); }
    return;
  }
  raycaster.setFromCamera(pointerNdc, camera);
  const hits = raycaster.intersectObjects(pickables, false);
  const id = hits.length ? hits[0].object.userData.partId : null;
  if (id !== state.hoveredId) {
    state.hoveredId = id;
    if (id) showHoverTag(id, event.clientX, event.clientY);
    else hideHoverTag();
    renderer.domElement.style.cursor = id ? 'pointer' : '';
  }
}

function onPointerUp(event) {
  if (pointerState.downTime && !pointerState.moved && performance.now() - pointerState.downTime < 600) {
    pickAt(event);
  }
  pointerState.downTime = 0;
}

function onDoubleClick(event) {
  pickAt(event, { fly: true });
}

function showHoverTag(id, clientX, clientY) {
  const data = parts.get(id).data;
  hoverTagEl.querySelector('.hover-tag__name').textContent = data.name;
  hoverTagEl.style.transform = `translate3d(${clientX + 16}px, ${clientY + 14}px, 0)`;
  hoverTagEl.classList.add('is-visible');
}

function hideHoverTag() {
  hoverTagEl.classList.remove('is-visible');
}

// ------------------------------------------------------------
// Keyboard
// ------------------------------------------------------------

function handleKeydown(event) {
  const target = event.target;
  if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
    if (event.key === 'Escape') target.blur();
    return;
  }
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  switch (event.key) {
    case '1': setView('front'); break;
    case '2': setView('rear'); break;
    case '3': setView('iso'); break;
    case '4': setView('top'); break;
    case 'e':
    case 'E': toggleExplode(); break;
    case 'x':
    case 'X': toggleXray(); break;
    case 'd':
    case 'D': toggleDimensions(); break;
    case 'r':
    case 'R': resetView(); break;
    case 'f':
    case 'F': if (state.selectedId) focusPart(state.selectedId); break;
    case '/': event.preventDefault(); $('#partSearch').focus(); break;
    case 'Escape': closeTopLayer(); break;
    default: return;
  }
  event.preventDefault();
}

// ------------------------------------------------------------
// UI wiring
// ------------------------------------------------------------

function bindEvents() {
  hoverTagEl = $('#hoverTag');
  const canvas = renderer.domElement;
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);
  canvas.addEventListener('pointerup', onPointerUp);
  canvas.addEventListener('dblclick', onDoubleClick);
  canvas.addEventListener('wheel', () => setAutoRotate(false), { passive: true });
  canvas.addEventListener('contextmenu', (event) => event.preventDefault());
  canvas.addEventListener('pointerleave', () => { state.hoveredId = null; hideHoverTag(); });
  window.addEventListener('resize', onResize);
  window.addEventListener('keydown', handleKeydown);

  $('#brandHome').addEventListener('click', (event) => { event.preventDefault(); resetView(); });
  $('#partsToggle').addEventListener('click', togglePartsPanel);
  $('#partsClose').addEventListener('click', togglePartsPanel);
  $('#themeToggle').addEventListener('click', toggleTheme);
  $('#cameraBtn').addEventListener('click', () => openModal('cameraModal'));
  $('#helpBtn').addEventListener('click', () => openModal('helpModal'));

  const search = $('#partSearch');
  search.addEventListener('input', () => { partQuery = search.value; applyPartFilter(); });

  $('#filterChips').addEventListener('click', (event) => {
    const chip = event.target.closest('.filter-chip');
    if (!chip) return;
    partFilter = chip.dataset.filter;
    $$('.filter-chip').forEach((c) => {
      c.classList.toggle('is-active', c === chip);
      c.setAttribute('aria-selected', String(c === chip));
    });
    applyPartFilter();
  });

  $('#inspectorClose').addEventListener('click', () => selectPart(null));
  $('#backToOverview').addEventListener('click', () => selectPart(null));
  $('#focusPartBtn').addEventListener('click', () => { if (state.selectedId) focusPart(state.selectedId); });
  $('#explodePartBtn').addEventListener('click', () => {
    if (!state.selectedId) return;
    focusPart(state.selectedId);
    setExplode(100);
    toast('已聚焦并展开拆解');
  });

  $$('#viewButtons button').forEach((button) => {
    button.addEventListener('click', () => setView(button.dataset.view));
  });
  $('#explodeBtn').addEventListener('click', toggleExplode);
  const range = $('#explodeRange');
  range.addEventListener('input', () => setExplode(parseInt(range.value, 10)));
  $('#xrayBtn').addEventListener('click', () => toggleXray());
  $('#dimensionBtn').addEventListener('click', () => toggleDimensions());
  $('#autorotateBtn').addEventListener('click', () => setAutoRotate(!state.autoRotate));
  $('#resetBtn').addEventListener('click', resetView);

  $('#openRearCamera').addEventListener('click', () => startCamera('environment'));
  $('#openFrontCamera').addEventListener('click', () => startCamera('user'));
  $('#stopCameraBtn').addEventListener('click', stopCamera);

  $$('[data-close-modal]').forEach((el) => {
    el.addEventListener('click', () => {
      const modal = el.closest('.modal');
      if (modal) closeModal(modal.id);
    });
  });
  $('#drawerScrim').addEventListener('click', closeDrawers);
}

function onResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(window.innerWidth, window.innerHeight, false);
}

// ------------------------------------------------------------
// Animation loop
// ------------------------------------------------------------

let lastFrameTime = 0;

function render(time) {
  const elapsed = time * 0.001;
  const delta = Math.min(Math.max(elapsed - lastFrameTime, 0.001), 0.1);
  lastFrameTime = elapsed;

  const settle = 1 - Math.pow(0.0018, delta);
  state.explodeCurrent += (state.explodeTarget - state.explodeCurrent) * settle;
  applyExplosionPositions(delta);

  updateCameraTween(delta);
  controls.update();

  if (particleSystem) {
    particleSystem.rotation.y += delta * 0.007;
    particleSystem.material.opacity = 0.42 + Math.sin(elapsed * 0.32) * 0.1;
  }
  if (floorDisc && !state.cameraOn) {
    floorDisc.material.opacity = (state.theme === 'star' ? 0.75 : 0.9) * (0.82 + Math.sin(elapsed * 0.24) * 0.12);
  }

  updateSelectionSprite(elapsed);
  updateLabelsAndLeaders();
  updateGizmo(elapsed);
  updateStageReadout();

  renderer.render(scene, camera);
}

// ------------------------------------------------------------
// Init
// ------------------------------------------------------------

const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

function playIntro() {
  if (reducedMotion) {
    setView('front', true);
    return;
  }
  camera.position.set(-15.5, 8.5, 25);
  controls.target.set(0, 0, 0);
  const pose = viewPose('front');
  flyCamera(pose.position, pose.target, 2.1, () => {
    setAutoRotate(true, true);
  });
  introPlayed = true;
}

function init() {
  try {
    setLoader('COMPILING SHADERS');
    createRenderer();
    createScene();
    setLoader('GENERATING TEXTURES');
    createMaterials();
    createEnvironment();
    createLights();
    createFloor();
    createParticles();
    setLoader('BUILDING 22 MODULES');
    buildDevice();
    buildDimensions();
    buildLabels();
    buildPartList();
    bindEvents();

    applyTheme(state.theme);
    setExplode(0, { silent: true });
    updateRenderModeLabel();
    updateModeLabel();

    state.ready = true;
    window.__duoReady = true;
    document.body.classList.remove('is-loading');
    const loader = $('#loader');
    if (loader) {
      loader.classList.add('is-hidden');
      setTimeout(() => loader.remove(), 650);
    }

    toast('程序化模型已就绪 — 点击任意部件开始拆解');
    announce('iPhone Duo 拆解实验室已就绪。可点击部件查看详情，拖动底部滑杆展开拆解。');
    playIntro();

    renderer.setAnimationLoop(render);
  } catch (error) {
    console.error('[iPhone Duo] init failed:', error);
    const status = $('#loaderStatus');
    if (status) {
      status.textContent = 'RENDERER ERROR — ' + error.message;
      status.classList.add('is-error');
    }
    const fallback = $('#webglFallback');
    if (fallback) fallback.hidden = false;
    if (window.__duoReady === undefined) window.__duoReady = false;
  }
}

init();
