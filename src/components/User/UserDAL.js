/* eslint-disable no-cond-assign */
/* eslint-disable no-constant-condition */
/* eslint-disable camelcase */
import oracledb from 'oracledb';
import config from '../../config';
import { ERRORS } from '../../constant/index';
import moment from 'moment';

export const getPayment = async (id) => {
  let connection;
  const { p_dblink } = config;
  const p_tinh = mapProvine(id);
  if (!p_tinh) return Promise.reject(ERRORS.CLIENT_NOT_EXIST);
  const p_date = '2020';
  const sql = `select a.ID_HDON, CONCAT(a.thang,CONCAT('/',CONCAT(a.nam,CONCAT('-',a.ky) ))) as ky
        ,a.NGAY_PHANH,a.NGAY_DKY,a.NGAY_CKY,sum(a.DIEN_TTHU) as TONG_DIEN,
        concat ((round((sum(a.DIEN_TTHU)-sum(b.DIEN_TTHU))/sum(b.DIEN_TTHU),2) * 100),'%')as tyle_so_sanh, 
        sum(a.SO_TIEN) SO_TIEN,SUM(a.TIEN_GTGT)TIEN_GTGT,sum(a.TONG_TIEN)TONG_TIEN,sum(a.COSFI)COSFI,sum(a.KCOSFI)KCOSFI,a.LOAI_HDON   
                from(
              select ID_HDON,LOAI_HDON, ky,thang,nam, DIEN_TTHU, SO_TIEN, TIEN_GTGT, TONG_TIEN,  
              NGAY_DKY, NGAY_CKY,COSFI,KCOSFI,NGAY_PHANH,ma_khang
              from ${p_tinh}HDN_HDON${p_dblink}
              where ma_khang='${id}'
        and EXTRACT(year FROM NGAY_cKY)='${p_date}'
           union
              select ID_HDON,LOAI_DCHINH, ky,thang,nam,  DIEN_TTHU, SO_TIEN, TIEN_GTGT, TONG_TIEN,  
              NGAY_DKY, NGAY_CKY,COSFI,KCOSFI,NGAY_PHANH,ma_khang
              from ${p_tinh}hdn_hdon_dc${p_dblink}
              where ma_khang='${id}'
        and EXTRACT(year FROM NGAY_cKY)='${p_date}'
              ) a left join 
        (
             select ID_HDON,LOAI_HDON, ky,thang,nam,  DIEN_TTHU, SO_TIEN, TIEN_GTGT, TONG_TIEN,  
              NGAY_DKY, NGAY_CKY,COSFI,KCOSFI,NGAY_PHANH,ma_khang
              from ${p_tinh}HDN_HDON${p_dblink} 
              where ma_khang='${id}'
        and EXTRACT(year FROM NGAY_cKY)='${p_date}'
           union
              select ID_HDON,LOAI_DCHINH, ky,thang,nam,  DIEN_TTHU, SO_TIEN, TIEN_GTGT, TONG_TIEN,  
              NGAY_DKY, NGAY_CKY,COSFI,KCOSFI,NGAY_PHANH,ma_khang
              from ${p_tinh}hdn_hdon_dc${p_dblink} 
              where ma_khang='${id}'
        and EXTRACT(year FROM NGAY_cKY)='${p_date}'
              ) b on a.ma_khang=b.ma_khang and extract (month from a.ngay_cky)=extract (month from b.ngay_cky)+1
              and a.ky=b.ky
              group by a.ID_HDON,a.LOAI_HDON,a.ky,a.thang,a.nam,a.NGAY_DKY,a.NGAY_CKY,a.NGAY_PHANH,b.ngay_cky,b.ky
              order by  a.ngay_cky desc`;
  try {
    connection = await oracledb.getConnection(config.oracle);
    const result = await connection.execute(sql);
    const keys = result.metaData.map(doc => doc.name);
    const data = result.rows;
    const finalData = data.map((row) => {
      const obj = {};
      for (let i = 0; i < row.length; i++) {
        if (['COSFI', 'KCOSFI'].includes(keys[i])) {
          const val = row[i] ? +row[i].toFixed(2) : null;
          obj[keys[i]] = val;
        } else if (['NGAY_PHANH', 'NGAY_DKY', 'NGAY_CKY'].includes(keys[i])) {
          const date = row[i] ? moment(row[i]).add(7, 'hours').format('DD/MM/YYYY') : null;
          obj[keys[i]] = date;
        } else {
          obj[keys[i]] = row[i];
        }
      }
      return obj;
    });
    await connection.close();
    return { data: finalData };
  } catch (e) {
    console.log('oi ne');
    if (connection) await connection.close();
    return Promise.reject('SOMETHING HAPPEN');
  }
};

const mapProvine = (id) => {
  let p_tinh;
  const p_substring4 = id.substr(0, 4);
  const p_substring2 = id.substr(0, 2);

  if (p_substring4 === 'PA01') p_tinh = 'NAMDINH.';
  else if (p_substring4 === 'PA04') p_tinh = 'THAINGUYEN.';
  else if (p_substring4 === 'PA09') p_tinh = 'THAIBINH.';
  else if (p_substring4 === 'PA11') p_tinh = 'LANGSON.';
  else if (p_substring4 === 'PA14') p_tinh = 'CAOBANG.';
  else if (p_substring4 === 'PA15') p_tinh = 'SONLA.';
  else if (p_substring4 === 'PA18') p_tinh = 'LAOCAI.';
  else if (p_substring4 === 'PA19') p_tinh = 'DIENBIEN.';
  else if (p_substring4 === 'PA22') p_tinh = 'BACNINH.';
  else if (p_substring4 === 'PA23') p_tinh = 'HUNGYEN.';
  else if (p_substring4 === 'PA24') p_tinh = 'HANAM.';
  else if (p_substring4 === 'PA25') p_tinh = 'VINHPHUC.';
  else if (p_substring4 === 'PA26') p_tinh = 'BACKAN.';
  else if (p_substring4 === 'PA29') p_tinh = 'LAICHAU.';
  else if (p_substring2 === 'PN') p_tinh = 'NINHBINH.';
  else if (p_substring2 === 'PM') p_tinh = 'HAIDUONG.';
  else if (p_substring2 === 'PH') p_tinh = 'HAIPHONG.';
  else if (p_substring4 === 'PA02') p_tinh = 'PHUTHO.';
  else if (p_substring4 === 'PA03') p_tinh = 'QUANGNINH.';
  else if (p_substring4 === 'PA05') p_tinh = 'BACGIANG.';
  else if (p_substring4 === 'PA07') p_tinh = 'THANHHOA.';
  else if (p_substring4 === 'PA10') p_tinh = 'YENBAI.';
  else if (p_substring4 === 'PA12') p_tinh = 'TUYENQUANG.';
  else if (p_substring4 === 'PA13') p_tinh = 'NGHEAN.';
  else if (p_substring4 === 'PA16') p_tinh = 'HATINH.';
  else if (p_substring4 === 'PA17') p_tinh = 'HOABINH.';
  else if (p_substring4 === 'PA20') p_tinh = 'HAGIANG.';
  else return null;
  return p_tinh;
};
