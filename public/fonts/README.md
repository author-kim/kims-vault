# 서체 출처

서체 파일은 원본 그대로 자체 호스팅한다. UI는 본고딕을 사용하며 본문 글꼴로도 선택할 수 있다. 본문 글꼴 선택항목의 이름도 해당 서체로 표시하므로 설정 패널을 열면 미리보기에 필요한 서체 파일이 로드될 수 있다.

| 디렉터리 | 서체 | 배포처·조건 |
| --- | --- | --- |
| source-han-sans | 본고딕 Regular·Medium | Adobe 공식 release의 SubsetOTF/KR, SIL OFL 1.1. LICENSE.txt 포함 |
| kopub-batang | KoPub 바탕 Regular·Bold | Google Fonts 공식 ofl/kopubbatang, SIL OFL 1.1. LICENSE.txt 포함 |
| bookk-myungjo | 부크크 명조 Light·Bold | 부크크 공식 원본 TTF. LICENSE.md에 공식 출처와 조건 기록 |
| maruburi | 마루부리 Regular·Bold | 네이버 공식 배포 ZIP의 원본 OTF. SIL OFL 1.1. LICENSE.txt 포함 |
| ridibatang | 리디바탕 Regular | 리디 공식 원본 OTF. SIL OFL 1.1. LICENSE.txt 포함 |

- 본고딕: https://github.com/adobe-fonts/source-han-sans/tree/release/SubsetOTF/KR
- KoPub 바탕: https://github.com/google/fonts/tree/main/ofl/kopubbatang
- 부크크 명조: https://bookk.co.kr/font
- 마루부리: https://hangeul.naver.com/font
  - 다운로드: https://hangeul.naver.com/hangeul_static/webfont/zips/maruburi.zip
  - 라이선스: https://help.naver.com/service/30016/contents/18088?osType=PC&lang=ko
- 리디바탕: https://ridicorp.com/ridibatang/
  - 다운로드: https://ridicorp.com/wp-content/themes/ridicorp/css/font/RIDIBatang.otf

마루부리는 ZIP 안의 `MaruBuriOTF.zip`에서 Regular·Bold만 포함했다. 리디바탕은 배포된 단일 굵기를 사용한다. 폰트 파일은 수정·변환하지 않았고, 프로젝트 내 파일명만 `Regular.otf`·`Bold.otf`로 통일했다. 본고딕의 본문 굵기 선택은 기존에 포함된 Regular(400)·Medium(500)을 사용한다.

폰트는 원본 OTF·TTF라 파일 크기가 크다. 특히 부크크 명조는 수정·변환 없이 배포본 그대로 사용한다. 글꼴 로딩 중에는 디바이스 기본 서체로 읽을 수 있고, 로딩 실패 시 설정 화면에 안내한다.
