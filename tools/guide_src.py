# Nội dung "Hướng dẫn sử dụng" dùng chung cho trang giới thiệu (artifact) và màn hình trong app.
import re, html
APPJS = open('/home/claude/meow-launcher/src/renderer/app.js', encoding='utf8').read()
GLYPH = dict(re.findall(r"^  (\w+): '(<[^']+)',?$", APPJS, re.M))
def svg(name):
    return f'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">{GLYPH[name]}</svg>'
def kbd(s):
    return ' + '.join(f'<kbd>{html.escape(k)}</kbd>' for k in s.split('+'))

STEPS = [
  ('Cài đặt', 'Chạy <b>MeowLauncherSetup.exe</b>. Windows báo “đã bảo vệ máy tính” thì bấm <b>Thông tin thêm → Vẫn chạy</b>. Máy có ổ D thì mặc định cài vào <code>D:\\Apps\\Meow Launcher</code>.'),
  ('Thêm app', 'Lần đầu mở, bấm <b>Quét app trên máy</b>. Meow tìm shortcut trong Start Menu và màn hình chính, tự xếp theo thể loại. Hoặc kéo shortcut thả thẳng vào cửa sổ.'),
  ('Gọi Meow ở bất kỳ đâu', 'Nhấn ' + kbd('Alt+Space') + ', gõ vài chữ đầu tên app rồi nhấn <kbd>Enter</kbd>. Meow chạy nền ở khay hệ thống, bật máy là sẵn sàng.'),
]
KEYS = [
  ('Alt+Space', 'Mở hoặc ẩn Meow Launcher'),
  ('Ctrl+Shift+V', 'Mở lịch sử copy'),
  ('Ctrl+Alt+F', 'Bật hoặc tắt overlay FPS khi chơi game'),
  ('Ctrl+K', 'Nhảy vào ô tìm kiếm'),
  ('↑ ↓ ← →', 'Chọn app'),
  ('Enter', 'Mở app đang chọn'),
  ('Ctrl+Enter', 'Mở app với quyền Admin'),
  ('Delete', 'Xoá app đang chọn khỏi Meow'),
  ('Esc', 'Xoá ô tìm kiếm, quay lại, rồi ẩn cửa sổ'),
]
CMDS = [
  ('=15*24', 'Tính nhanh, Enter để copy kết quả. Dùng được + − × ÷, %, ^ và ngoặc.'),
  ('ip', 'Xem IP nội bộ và IP công cộng của máy.'),
  ('báo cáo', 'Tìm cả file và thư mục, ưu tiên file mở gần đây.'),
  ('tắt máy', 'Tắt máy, khởi động lại, khoá máy, ngủ, hẹn giờ tắt máy.'),
  ('fps', 'Bật hoặc tắt overlay FPS và nhiệt độ.'),
  ('dns', 'Gõ tên lỗi hoặc tên công cụ để mở thẳng công cụ đó.'),
  ('device', 'Mở công cụ có sẵn của Windows: Device Manager, Services…'),
]
TOOLS = [
  ('ov', 'Overlay FPS', '#e8602a', 'Bảng nhỏ ở góc màn hình khi chơi game: FPS, CPU, GPU, RAM và nhiệt độ.'),
  ('clean', 'Dọn rác', '#8b6b2e', 'Quét tệp tạm, thùng rác, bộ nhớ đệm trình duyệt. Xác nhận rồi mới xoá.'),
  ('proc', 'App đang chạy', '#c42b1c', 'Xem app tốn CPU, RAM. Tắt từng app hoặc nhiều app một lúc.'),
  ('startup', 'App tự khởi động', '#5b6bd6', 'Tắt bớt app tự chạy khi bật máy để khởi động nhanh hơn.'),
  ('uninst', 'Gỡ cài đặt', '#a3562a', 'Danh sách app đã cài kèm dung lượng, gỡ ngay tại chỗ.'),
  ('fix', 'Sửa lỗi nhanh', '#1f8a5b', 'Xoá DNS, làm mới IP, reset mạng, sửa máy in, khởi động lại Explorer.'),
  ('info', 'Thông tin máy', '#4a6b80', 'Cấu hình, IP, MAC, ổ đĩa. Copy gửi IT chỉ một chạm.'),
  ('clip', 'Lịch sử copy', '#8a4fbf', '50 lần copy gần nhất, ghim mục hay dùng, tìm lại dễ dàng.'),
  ('win', 'Công cụ Windows', '#2f6fd6', 'Control Panel, Device Manager, Disk Management, Services…'),
]
TIPS = [
  ('Nhóm app', 'Tạo nhóm như “Vào ca làm việc”, bấm một lần mở cả nhóm.'),
  ('Chuột phải', 'Vào app để ghim Yêu thích, đổi tên, chuyển danh mục, chạy Admin, mở thư mục chứa.'),
  ('Danh mục riêng', 'Bấm <b>+ Thêm app → Thêm danh mục</b>. Chuột phải vào danh mục để đổi tên hoặc xoá.'),
  ('Màn hình chính gọn', 'Shortcut kéo vào Meow được cất vào thư mục sao lưu. Muốn trả lại thì vào Cài đặt › Khôi phục.'),
  ('Kiểu popup', 'Cài đặt › Kiểu cửa sổ › Popup: chỉ hiện ô tìm kiếm giữa màn hình, chọn app xong tự ẩn.'),
  ('Đổi màu', 'Mướp, Trắng, Hồng, Xám, Mun, hoặc Theo Windows. Icon trên khay hệ thống đổi theo.'),
]
FAQ = [
  ('Nhấn Alt+Space không thấy gì?', 'Có app khác đang giữ phím này, Meow sẽ tạm dùng <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Space</kbd> và báo cho bạn. Vào Cài đặt › Phím tắt để chọn tổ hợp khác.'),
  ('Bấm nút X sao app không tắt?', 'Nút X chỉ ẩn Meow xuống khay hệ thống để phím tắt vẫn chạy. Muốn tắt hẳn: chuột phải icon chân mèo ở khay › Thoát.'),
  ('Dữ liệu của tôi lưu ở đâu?', 'Trong <code>%APPDATA%\\Meow Launcher</code>. Cài lại hay nâng cấp không mất danh sách app. Muốn chép sang máy khác: Cài đặt › Xuất ra file, sang máy mới chọn Nhập từ file.'),
  ('Vì sao có hộp xác nhận Admin?', 'Một số việc cần quyền quản trị của Windows: dọn tệp tạm hệ thống, reset mạng, sửa máy in, bật tắt app khởi động cho mọi người dùng. Bấm Không thì Meow bỏ qua mục đó.'),
  ('Tắt app có mất file chưa lưu không?', 'Không. Meow đóng app như khi bạn bấm nút X, app sẽ hỏi lưu nếu cần. App nào không chịu tắt mới hiện nút Buộc tắt để bạn tự quyết.'),
  ('Overlay không hiện trong game?', 'Chọn chế độ hiển thị <b>Borderless</b> hoặc <b>Windowed Fullscreen</b> trong game. Chế độ Fullscreen độc quyền sẽ che mọi cửa sổ khác. Đo FPS cần quyền Admin, bấm Có khi Windows hỏi.'),
  ('Cập nhật Meow thế nào?', 'Meow tự xem bản mới trên GitHub và báo bằng thông báo. Bấm <b>Cập nhật ngay</b>, Meow tự tải, cài đè và mở lại, giữ nguyên app và cài đặt. Muốn xem tay: Cài đặt › Cập nhật › Kiểm tra ngay.'),
  ('Gỡ Meow Launcher thế nào?', 'Mở Cài đặt Windows › Ứng dụng › Meow Launcher › Gỡ cài đặt, hoặc dùng chính mục Gỡ cài đặt trong Meow.'),
]

def build():
    h = []
    h.append('<div class="guide">')
    # Bắt đầu
    h.append('<section class="g-sec"><div class="g-h"><p class="g-cap">Bắt đầu</p><h2>Ba bước để dùng</h2></div><ol class="g-steps">')
    for i, (t, d) in enumerate(STEPS, 1):
        h.append(f'<li><span class="g-n">{i}</span><b>{t}</b><p>{d}</p></li>')
    h.append('</ol></section>')
    # Phím tắt + lệnh
    h.append('<section class="g-sec g-two"><div class="g-col"><div class="g-h"><p class="g-cap">Bàn phím</p><h2>Phím tắt</h2></div><div class="g-keys">')
    for k, d in KEYS:
        kk = ' '.join(f'<kbd>{x}</kbd>' for x in k.split(' ')) if ' ' in k else kbd(k)
        h.append(f'<div class="g-key"><span>{kk}</span><span>{d}</span></div>')
    h.append('</div><p class="g-note">Đổi phím tắt trong Cài đặt › Phím tắt.</p></div>')
    h.append('<div class="g-col"><div class="g-h"><p class="g-cap">Ô tìm kiếm</p><h2>Gõ lệnh nhanh</h2></div><div class="g-cmds">')
    for c, d in CMDS:
        h.append(f'<button class="g-cmd" data-try="{html.escape(c)}" title="Thử ngay"><code>{html.escape(c)}</code><span>{d}</span><i>Thử</i></button>')
    h.append('</div></div></section>')
    # Công cụ
    h.append('<section class="g-sec"><div class="g-h"><p class="g-cap">Thanh bên › Công cụ hệ thống</p><h2>Chăm sóc máy</h2></div><div class="g-tools">')
    for id_, n, col, d in TOOLS:
        h.append(f'<button class="g-tool" data-go="{id_}"><span class="ci" style="--c:{col}">{svg(id_)}</span><span><b>{n}</b><small>{d}</small></span></button>')
    h.append('</div></section>')
    # Mẹo
    h.append('<section class="g-sec"><div class="g-h"><p class="g-cap">Mẹo</p><h2>Dùng cho sướng tay</h2></div><div class="g-tips">')
    for t, d in TIPS:
        h.append(f'<div class="g-tip"><b>{t}</b><p>{d}</p></div>')
    h.append('</div></section>')
    # Hỏi đáp
    h.append('<section class="g-sec"><div class="g-h"><p class="g-cap">Hỏi đáp</p><h2>Câu hỏi thường gặp</h2></div><div class="g-faq">')
    for q, a in FAQ:
        h.append(f'<details><summary>{q}</summary><p>{a}</p></details>')
    h.append('</div></section>')
    h.append('</div>')
    return '\n'.join(h)

CSS = r'''
/* ===== Hướng dẫn sử dụng ===== */
.guide{display:flex;flex-direction:column;gap:20px}
.g-sec{background:var(--win);border:1px solid var(--line);border-radius:var(--r,16px);padding:22px 24px;box-shadow:var(--shadow);backdrop-filter:blur(36px) saturate(170%);-webkit-backdrop-filter:blur(36px) saturate(170%);display:flex;flex-direction:column;gap:14px;min-width:0}
.g-h h2{margin:0;font-family:var(--display);font-weight:900;font-size:22px;letter-spacing:-.01em;text-wrap:balance}
.g-cap{margin:0 0 2px;font-size:11px;letter-spacing:.09em;text-transform:uppercase;color:var(--accent);font-weight:700}
.g-steps{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,220px),1fr));gap:12px}
.g-steps li{background:var(--card);border:1px solid var(--line);border-radius:14px;padding:16px;display:flex;flex-direction:column;gap:6px;position:relative}
.g-n{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--accent);color:var(--accent-fg);font-family:var(--display);font-weight:900;font-size:15px;box-shadow:0 6px 14px -6px var(--accent)}
.g-steps li>b{font-size:15px}
.g-steps p,.g-tip p,.g-faq p{margin:0;color:var(--muted);font-size:13px;line-height:1.55}
.guide code{font-family:var(--mono);font-size:12px;background:var(--pane);border:1px solid var(--line);border-radius:5px;padding:0 5px;color:var(--fg);overflow-wrap:anywhere}
.g-two{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,320px),1fr));gap:24px}
.g-col{display:flex;flex-direction:column;gap:12px;min-width:0}
.g-keys{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden}
.g-key{display:grid;grid-template-columns:minmax(120px,auto) 1fr;gap:14px;align-items:center;padding:8px 14px;border-bottom:1px solid var(--line);font-size:13px}
.g-key:last-child{border-bottom:0}
.g-key span:first-child{white-space:nowrap}
.g-note{margin:0;color:var(--muted);font-size:12px}
.g-cmds{display:flex;flex-direction:column;gap:6px}
.g-cmd{display:grid;grid-template-columns:auto 1fr auto;gap:12px;align-items:center;text-align:left;border:1px solid var(--line);background:var(--card);border-radius:12px;padding:8px 12px;font-size:13px;color:var(--muted)}
.g-cmd code{font-size:12.5px;color:var(--accent);background:var(--accent-soft);border-color:transparent;padding:2px 8px}
.g-cmd i{font-style:normal;font-size:12px;font-weight:600;color:var(--accent);opacity:0;transition:opacity .15s}
.g-cmd:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line))}
.g-cmd:hover i,.g-cmd:focus-visible i{opacity:1}
.g-tools{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,250px),1fr));gap:10px}
.g-tool{display:flex;gap:12px;align-items:flex-start;text-align:left;border:1px solid var(--line);background:var(--card);border-radius:14px;padding:14px}
.g-tool:hover{border-color:color-mix(in srgb,var(--accent) 50%,var(--line));box-shadow:0 6px 18px -10px rgba(0,0,0,.25)}
.g-tool .ci{width:38px;height:38px;border-radius:11px;flex:none}
.g-tool .ci svg{width:19px;height:19px}
.g-tool b{display:block;font-weight:600;margin-bottom:2px}
.g-tool small{color:var(--muted);font-size:12.5px;line-height:1.45}
.g-tips{display:grid;grid-template-columns:repeat(auto-fill,minmax(min(100%,240px),1fr));gap:10px}
.g-tip{border-left:3px solid var(--accent);padding:4px 0 4px 14px;display:flex;flex-direction:column;gap:3px}
.g-tip b{font-size:13.5px}
.g-faq{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:12px;background:var(--card);overflow:hidden}
.g-faq details{border-bottom:1px solid var(--line)}
.g-faq details:last-child{border-bottom:0}
.g-faq summary{cursor:pointer;padding:12px 16px;font-weight:600;font-size:13.5px;list-style:none;display:flex;justify-content:space-between;gap:12px}
.g-faq summary::-webkit-details-marker{display:none}
.g-faq summary::after{content:"+";color:var(--accent);font-weight:700;font-size:16px;line-height:1}
.g-faq details[open] summary::after{content:"–"}
.g-faq details p{padding:0 16px 14px}
.g-foot{display:flex;justify-content:center;padding:8px 0 4px}
@media (max-width:560px){.g-sec{padding:18px 16px}.g-key{grid-template-columns:1fr}}
'''

# ---------- English ----------
EN = dict(
 STEPS=[
  ('Install', 'Run <b>MeowLauncherSetup.exe</b>. If Windows says it “protected your PC”, click <b>More info → Run anyway</b>. On PCs with a D drive it installs to <code>D:\\Apps\\Meow Launcher</code> by default.'),
  ('Add your apps', 'On first launch, click <b>Scan apps on this PC</b>. Meow finds shortcuts in the Start Menu and on the desktop and sorts them into categories. Or drag shortcuts straight into the window.'),
  ('Summon Meow anywhere', 'Press ' + kbd('Alt+Space') + ', type the first few letters of an app and press <kbd>Enter</kbd>. Meow runs in the system tray and is ready as soon as Windows starts.'),
 ],
 KEYS=[('Alt+Space','Show or hide Meow Launcher'),('Ctrl+Shift+V','Open clipboard history'),('Ctrl+Alt+F','Toggle the FPS overlay while gaming'),('Ctrl+K','Jump to the search box'),('↑ ↓ ← →','Select an app'),('Enter','Open the selected app'),('Ctrl+Enter','Open the app as administrator'),('Delete','Remove the selected app from Meow'),('Esc','Clear search, go back, then hide the window')],
 CMDS=[('=15*24','Quick math, Enter copies the result. Supports + − × ÷, %, ^ and brackets.'),('ip','Show the local and public IP of this PC.'),('report','Find files and folders too, recently opened files first.'),('shut down','Shut down, restart, lock, sleep or set a shutdown timer.'),('fps','Turn the FPS & temperature overlay on or off.'),('dns','Type a problem or tool name to open that tool directly.'),('device','Open built-in Windows tools: Device Manager, Services…')],
 TOOLS=[('ov','FPS overlay','#e8602a','A small panel in a screen corner while gaming: FPS, CPU, GPU, RAM and temperatures.'),('clean','Clean up','#8b6b2e','Scan temp files, Recycle Bin and browser caches. Nothing is deleted until you confirm.'),('proc','Running apps','#c42b1c','See which apps use the most CPU and RAM. Close one or many at once.'),('startup','Startup apps','#5b6bd6','Turn off apps that start with Windows so your PC boots faster.'),('uninst','Uninstall','#a3562a','Installed apps with their size, uninstall right there.'),('fix','Quick fixes','#1f8a5b','Flush DNS, renew IP, reset network, fix the printer, restart Explorer.'),('info','PC info','#4a6b80','Specs, IP, MAC, drives. Copy it all for IT in one click.'),('clip','Clipboard history','#8a4fbf','Your last 50 copies, pin the ones you reuse, search them anytime.'),('win','Windows tools','#2f6fd6','Control Panel, Device Manager, Disk Management, Services…')],
 TIPS=[('App groups','Create a group like “Start of shift” and open all of it with one click.'),('Right-click','Right-click an app to pin it, rename it, move it, run it as admin or open its folder.'),('Your own categories','Click <b>+ Add apps → Add category</b>. Right-click a category to rename or delete it.'),('Tidy desktop','Shortcuts you drag into Meow are moved to a backup folder. Get them back in Settings › Restore.'),('Popup style','Settings › Window style › Popup: just a search box in the middle of the screen that hides after you pick an app.'),('Colors','Tabby, White, Pink, Gray, Midnight or Match Windows. The tray icon changes too.')],
 FAQ=[('Nothing happens when I press Alt+Space?','Another app is using that key. Meow switches to <kbd>Ctrl</kbd> + <kbd>Alt</kbd> + <kbd>Space</kbd> and tells you. Pick another combination in Settings › Shortcuts.'),('Why doesn’t the X button quit the app?','X only hides Meow to the system tray so the shortcut keeps working. To quit: right-click the paw icon in the tray › Quit.'),('Where is my data stored?','In <code>%APPDATA%\\Meow Launcher</code>. Reinstalling or updating keeps your apps. To move to another PC: Settings › Export to file, then Import from file on the new PC.'),('Why do I see an admin prompt?','Some tasks need Windows administrator rights: cleaning system temp files, resetting the network, fixing the printer, changing startup apps for all users. Click No and Meow skips that item.'),('Will closing an app lose unsaved work?','No. Meow closes apps like the X button does, so they can ask you to save. Only apps that refuse get a Force close button, and you decide.'),('The overlay doesn’t show in my game?','Set the game to <b>Borderless</b> or <b>Windowed Fullscreen</b>. Exclusive Fullscreen covers every other window. Counting FPS needs administrator rights, click Yes when Windows asks.'),('How do I update Meow?','Meow checks GitHub for new versions and notifies you. Click <b>Update now</b>: Meow downloads, installs over the old version and reopens, keeping your apps and settings. To check by hand: Settings › Updates › Check now.'),('How do I uninstall Meow Launcher?','Open Windows Settings › Apps › Meow Launcher › Uninstall, or use Uninstall inside Meow.')],
 L=dict(start='Get started', steps='Three steps', kb='Keyboard', keys='Shortcuts', keynote='Change shortcuts in Settings › Shortcuts.', sb='Search box', cmds='Quick commands', tcap='Sidebar › System tools', tools='Look after your PC', tipc='Tips', tips='Work faster', faqc='FAQ', faq='Common questions', tryit='Try', trytitle='Try it'),
)
VI_L = dict(start='Bắt đầu', steps='Ba bước để dùng', kb='Bàn phím', keys='Phím tắt', keynote='Đổi phím tắt trong Cài đặt › Phím tắt.', sb='Ô tìm kiếm', cmds='Gõ lệnh nhanh', tcap='Thanh bên › Công cụ hệ thống', tools='Chăm sóc máy', tipc='Mẹo', tips='Dùng cho sướng tay', faqc='Hỏi đáp', faq='Câu hỏi thường gặp', tryit='Thử', trytitle='Thử ngay')

def build_lang(lang='vi'):
    if lang == 'vi':
        d = dict(STEPS=STEPS, KEYS=KEYS, CMDS=CMDS, TOOLS=TOOLS, TIPS=TIPS, FAQ=FAQ, L=VI_L)
    else:
        d = EN
    Lx = d['L']; h = [f'<div class="guide"{" data-notr" if lang == "en" else ""}>']
    h.append(f'<section class="g-sec"><div class="g-h"><p class="g-cap">{Lx["start"]}</p><h2>{Lx["steps"]}</h2></div><ol class="g-steps">')
    for i, (t, x) in enumerate(d['STEPS'], 1): h.append(f'<li><span class="g-n">{i}</span><b>{t}</b><p>{x}</p></li>')
    h.append(f'</ol></section><section class="g-sec g-two"><div class="g-col"><div class="g-h"><p class="g-cap">{Lx["kb"]}</p><h2>{Lx["keys"]}</h2></div><div class="g-keys">')
    for k, x in d['KEYS']:
        kk = ' '.join(f'<kbd>{y}</kbd>' for y in k.split(' ')) if ' ' in k else kbd(k)
        h.append(f'<div class="g-key"><span>{kk}</span><span>{x}</span></div>')
    h.append(f'</div><p class="g-note">{Lx["keynote"]}</p></div><div class="g-col"><div class="g-h"><p class="g-cap">{Lx["sb"]}</p><h2>{Lx["cmds"]}</h2></div><div class="g-cmds">')
    for c, x in d['CMDS']: h.append(f'<button class="g-cmd" data-try="{html.escape(c)}" title="{Lx["trytitle"]}"><code>{html.escape(c)}</code><span>{x}</span><i>{Lx["tryit"]}</i></button>')
    h.append(f'</div></div></section><section class="g-sec"><div class="g-h"><p class="g-cap">{Lx["tcap"]}</p><h2>{Lx["tools"]}</h2></div><div class="g-tools">')
    for id_, n, col, x in d['TOOLS']: h.append(f'<button class="g-tool" data-go="{id_}"><span class="ci" style="--c:{col}">{svg(id_)}</span><span><b>{n}</b><small>{x}</small></span></button>')
    h.append(f'</div></section><section class="g-sec"><div class="g-h"><p class="g-cap">{Lx["tipc"]}</p><h2>{Lx["tips"]}</h2></div><div class="g-tips">')
    for t, x in d['TIPS']: h.append(f'<div class="g-tip"><b>{t}</b><p>{x}</p></div>')
    h.append(f'</div></section><section class="g-sec"><div class="g-h"><p class="g-cap">{Lx["faqc"]}</p><h2>{Lx["faq"]}</h2></div><div class="g-faq">')
    for q, a in d['FAQ']: h.append(f'<details><summary>{q}</summary><p>{a}</p></details>')
    h.append('</div></section></div>')
    return '\n'.join(h)
