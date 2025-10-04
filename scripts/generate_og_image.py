from PIL import Image, ImageDraw, ImageFont
import os

# 이미지 크기 (OG 이미지 표준)
WIDTH = 1200
HEIGHT = 630

def create_og_image(output_path, title_text, subtitle_text, bg_color):
    # 이미지 생성
    image = Image.new('RGB', (WIDTH, HEIGHT), bg_color)
    draw = ImageDraw.Draw(image)
    
    try:
        # Windows 한글 폰트 경로
        title_font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 80)
        subtitle_font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 40)
        domain_font = ImageFont.truetype('C:/Windows/Fonts/malgun.ttf', 30)
    except:
        print("맑은고딕 폰트를 찾을 수 없습니다. 기본 폰트를 사용합니다.")
        title_font = ImageFont.load_default()
        subtitle_font = ImageFont.load_default()
        domain_font = ImageFont.load_default()
    
    # 텍스트 위치 계산 (중앙 정렬)
    title_bbox = draw.textbbox((0, 0), title_text, font=title_font)
    title_width = title_bbox[2] - title_bbox[0]
    title_x = (WIDTH - title_width) // 2
    title_y = 200
    
    subtitle_bbox = draw.textbbox((0, 0), subtitle_text, font=subtitle_font)
    subtitle_width = subtitle_bbox[2] - subtitle_bbox[0]
    subtitle_x = (WIDTH - subtitle_width) // 2
    subtitle_y = 320
    
    domain_text = "youtube-analyze.money-hotissue.com"
    domain_bbox = draw.textbbox((0, 0), domain_text, font=domain_font)
    domain_width = domain_bbox[2] - domain_bbox[0]
    domain_x = (WIDTH - domain_width) // 2
    domain_y = 480
    
    # 텍스트 그리기 (흰색)
    draw.text((title_x, title_y), title_text, font=title_font, fill='white')
    draw.text((subtitle_x, subtitle_y), subtitle_text, font=subtitle_font, fill='white')
    
    # 도메인 텍스트 (박스 배경)
    domain_box_padding = 20
    domain_box = [
        domain_x - domain_box_padding,
        domain_y - 10,
        domain_x + domain_width + domain_box_padding,
        domain_y + 50
    ]
    draw.rectangle(domain_box, fill='white')
    draw.text((domain_x, domain_y), domain_text, font=domain_font, fill=bg_color)
    
    # 이미지 저장
    image.save(output_path, 'PNG', quality=95)
    print(f"OG 이미지 생성 완료: {output_path}")

# public 디렉토리 경로
script_dir = os.path.dirname(os.path.abspath(__file__))
public_dir = os.path.join(os.path.dirname(script_dir), 'public')

# 메인 페이지 이미지
create_og_image(
    os.path.join(public_dir, 'og-image.png'),
    '유튜브 영상 분석 AI',
    'AI가 분석한 떡상 영상의 공식! 1분 만에',
    (139, 0, 0)  # 다크 레드
)

# 가이드 페이지 이미지
create_og_image(
    os.path.join(public_dir, 'og-image-guide.png'),
    '사용법 가이드',
    'AI 영상 분석 도구 완벽 사용법',
    (0, 51, 102)  # 다크 블루
)

# API 가이드 페이지 이미지
create_og_image(
    os.path.join(public_dir, 'og-image-api-guide.png'),
    'API 키 발급 가이드',
    'Google AI Studio API 키 발급 방법',
    (75, 0, 130)  # 다크 퍼플
)

print("\n모든 OG 이미지 생성이 완료되었습니다!")
