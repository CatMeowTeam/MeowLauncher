; Meow Launcher — tuỳ biến trình cài đặt / gỡ cài đặt. Phát triển bởi Catmeow Team
!include nsDialogs.nsh

; Mặc định cài vào D:\Apps nếu máy có ổ cứng D (vẫn đổi được ở bước chọn thư mục)
!macro customInit
  ReadRegStr $0 SHCTX "${INSTALL_REGISTRY_KEY}" InstallLocation
  ${StdUtils.GetParameter} $1 "D" ""
  System::Call 'kernel32::GetDriveTypeW(w "D:\") i .r2'
  ${If} $0 == ""
  ${AndIf} $1 == ""
  ${AndIf} $2 == 3
    StrCpy $INSTDIR "D:\Apps\${APP_FILENAME}"
  ${EndIf}
!macroend

; Trang chào mừng có ảnh mèo bên trái
!macro customWelcomePage
  !insertmacro MUI_PAGE_WELCOME
!macroend

; Đánh dấu vừa cài xong: Meow Launcher sẽ hiện màn hình chọn ngôn ngữ khi mở lần đầu (gợi ý theo ngôn ngữ Windows)
!macro customInstall
  ; Cập nhật tự động (im lặng) thì giữ nguyên ngôn ngữ đã chọn, không hỏi lại
  ${IfNot} ${isUpdated}
    ${If} $LANGUAGE == 1033
      StrCpy $3 "en"
    ${Else}
      StrCpy $3 "vi"
    ${EndIf}
    FileOpen $4 "$INSTDIR\install-lang.txt" w
    FileWrite $4 $3
    FileClose $4
  ${EndIf}
!macroend

; ---------------- GỠ CÀI ĐẶT ----------------
!ifdef BUILD_UNINSTALLER
Var MeowUnT
Var MeowUnB
Var MeowPgT
Var MeowPgS
Var MeowNote
Var MeowChkTxt
Var MeowFinT
Var MeowFinB
Var MeowChk
Var MeowDelData
Var MeowImg
Var MeowImgH


!endif

!macro customUnInit
  ; Hỏi lại bằng màn hình mèo dễ thương trước khi vào các bước gỡ (bỏ qua khi gỡ im lặng lúc cập nhật)
  ${IfNot} ${Silent}
    ${If} ${FileExists} "$INSTDIR\${APP_EXECUTABLE_FILENAME}"
      ExecWait '"$INSTDIR\${APP_EXECUTABLE_FILENAME}" --confirm-uninstall' $0
      ${If} $0 == 13
        Quit
      ${EndIf}
    ${EndIf}
  ${EndIf}
  ${If} $LANGUAGE == 1066
    StrCpy $MeowUnT "Ơ… bạn muốn chia tay Meow thật à?"
    StrCpy $MeowUnB "Meow hơi buồn xíu, nhưng sẽ dọn dẹp thật gọn gàng: gỡ app, shortcut và icon chân mèo ở khay hệ thống.$\r$\n$\r$\nĐổi ý thì bấm Huỷ, Meow vui lại liền!$\r$\n$\r$\nCòn không thì bấm Tiến nhé."
    StrCpy $MeowPgT "Dữ liệu của bạn"
    StrCpy $MeowPgS "Giữ lại để lần sau quay lại mọi thứ vẫn y nguyên?"
    StrCpy $MeowNote "Meow đang giữ danh sách app, nhóm app, cài đặt và lịch sử copy của bạn.$\r$\n$\r$\nMặc định Meow cất lại hết, cài lại là dùng tiếp được ngay."
    StrCpy $MeowChkTxt "Xoá luôn dữ liệu của tôi"
    StrCpy $MeowFinT "Tạm biệt nhé!"
    StrCpy $MeowFinB "Meow Launcher đã được gỡ khỏi máy.$\r$\n$\r$\nCảm ơn bạn đã cho Meow ở cùng một thời gian. Hẹn gặp lại!$\r$\n$\r$\n— Catmeow Team"
  ${Else}
    StrCpy $MeowUnT "Aww… are you really leaving Meow?"
    StrCpy $MeowUnB "Meow is a little sad, but will tidy up nicely: the app, its shortcuts and the paw icon in the system tray.$\r$\n$\r$\nChanged your mind? Click Cancel and Meow is happy again!$\r$\n$\r$\nOtherwise, click Next."
    StrCpy $MeowPgT "Your data"
    StrCpy $MeowPgS "Keep it so everything is still here if you come back?"
    StrCpy $MeowNote "Meow is keeping your app list, app groups, settings and clipboard history.$\r$\n$\r$\nBy default Meow keeps it all, so a reinstall picks up right where you left off."
    StrCpy $MeowChkTxt "Also delete my data"
    StrCpy $MeowFinT "Goodbye for now!"
    StrCpy $MeowFinB "Meow Launcher has been removed from this PC.$\r$\n$\r$\nThanks for letting Meow hang out with you. See you again!$\r$\n$\r$\n— Catmeow Team"
  ${EndIf}
!macroend

!macro customUnWelcomePage
Function un.MeowDataPage
  ${If} ${Silent}
    Abort
  ${EndIf}
  !insertmacro MUI_HEADER_TEXT "$MeowPgT" "$MeowPgS"
  nsDialogs::Create 1018
  Pop $0
  ${If} $0 == error
    Abort
  ${EndIf}
  InitPluginsDir
  File "/oname=$PLUGINSDIR\meowsad.bmp" "${BUILD_RESOURCES_DIR}\meowsad.bmp"
  ${NSD_CreateBitmap} 0 4u 64u 64u ""
  Pop $MeowImg
  ${NSD_SetStretchedImage} $MeowImg "$PLUGINSDIR\meowsad.bmp" $MeowImgH
  ${NSD_CreateLabel} 76u 6u 220u 56u "$MeowNote"
  Pop $1
  ${NSD_CreateCheckbox} 76u 70u 220u 14u "$MeowChkTxt"
  Pop $MeowChk
  ${If} $MeowDelData == ${BST_CHECKED}
    ${NSD_Check} $MeowChk
  ${EndIf}
  nsDialogs::Show
  ${NSD_FreeImage} $MeowImgH
FunctionEnd

Function un.MeowDataLeave
  ${NSD_GetState} $MeowChk $MeowDelData
FunctionEnd
  !define MUI_WELCOMEPAGE_TITLE "$MeowUnT"
  !define MUI_WELCOMEPAGE_TITLE_3LINES
  !define MUI_WELCOMEPAGE_TEXT "$MeowUnB"
  !insertmacro MUI_UNPAGE_WELCOME
  UninstPage custom un.MeowDataPage un.MeowDataLeave
  !define MUI_FINISHPAGE_TITLE "$MeowFinT"
  !define MUI_FINISHPAGE_TITLE_3LINES
  !define MUI_FINISHPAGE_TEXT "$MeowFinB"
!macroend

!macro customUnInstall
  ${If} $MeowDelData == ${BST_CHECKED}
    SetShellVarContext current
    RMDir /r "$APPDATA\Meow Launcher"
    SetShellVarContext all
  ${EndIf}
!macroend
