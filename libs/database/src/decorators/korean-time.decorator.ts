import { Transform } from 'class-transformer';

/**
 * 날짜/시간을 한국 시간대(UTC+9)로 변환하여 ISO String으로 반환하는 데코레이터
 */
export function KoreanTime() {
  return Transform(({ value }) => {
    if (!value) return null;
    return (
      new Date(value)
        .toLocaleString('sv-SE', {
          timeZone: 'Asia/Seoul',
        })
        .replace(' ', 'T') + '+09:00'
    );
  });
}

/**
 * 날짜/시간을 한국 시간대(UTC+9)로 변환하여 한국 로케일 형식으로 반환하는 데코레이터
 */
export function KoreanTimeLocale() {
  return Transform(({ value }) => {
    if (!value) return null;
    return new Date(value).toLocaleString('ko-KR', {
      timeZone: 'Asia/Seoul',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    });
  });
}
