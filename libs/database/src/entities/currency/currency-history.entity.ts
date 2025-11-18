import { Column, CreateDateColumn, Entity, Generated, PrimaryGeneratedColumn } from 'typeorm';

import { CurrencyUnit, CurrencyUnitValue } from '@libs/shared/const/currency';

// result: number; // 조회 결과, 1 : 성공, 2 : DATA코드 오류, 3 : 인증코드 오류, 4 : 일일제한횟수 마감
// cur_unit: string; // 통화코드
// cur_nm: string; // 국가/통화명
// ttb: string; // 전신환(송금) 받으실때
// tts: string; // 전신환(송금) 보내실때
// deal_bas_r: string; // 매매 기준율
// bkpr: string; // 장부가격
// yy_efee_r: string; // 년환가료율
// ten_dd_efee_r: string; // 10일환가료율
// kftc_deal_bas_r: string; // 서울외국환중개 매매기준율
// kftc_bkpr: string; // 서울외국환중개 장부가격

@Entity()
export class CurrencyHistory {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'varchar', length: 36 })
  @Generated('uuid')
  uuid: string;

  @Column({ type: 'varchar', length: 3, nullable: true, enum: CurrencyUnit, comment: '통화 코드' })
  curUnit: CurrencyUnitValue | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '국가/통화명' })
  curNm: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '통화 단위 설명' })
  curUnitDesc: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '전신환(송금) 받으실때' })
  ttb: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '전신환(송금) 보내실때' })
  tts: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '매매 기준율' })
  dealBasR: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '장부가격' })
  bkpr: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '년환가료율' })
  yyEfeeR: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '10일환가료율' })
  tenDdEfeeR: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '서울외국환중개 매매기준율' })
  kftcDealBasR: string | null;

  @Column({ type: 'varchar', length: 10, nullable: true, comment: '서울외국환중개 장부가격' })
  kftcBkpr: string | null;

  @CreateDateColumn({ type: 'timestamp' })
  createdAt: Date;
}
