// BAMBEH_DEPLOY_TOKEN__FARMFRESHORDER_FIX868_CLEAN
/**
 * src/routes/groups/community/FarmFreshOrderPage.tsx - Bambeh Marketplace (route /farm-fresh/order/:productId)
 *
 * FIX868 (replaces FIX170) - this page wrote a Farm Fresh order straight from the phone, outside Bambeh Secured Pay:
 * no protection, a price taken from the phone, a phone number typed in. Old links and old buttons now open the
 * product page (FIX867), where "Buy now" goes through Bambeh Secured Pay and the payments server reads the price
 * from the database (FIX862).
 * (c) 2026 BAMBEH SARL. All rights reserved.
 */
import { Navigate, useParams } from 'react-router-dom';

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function FarmFreshOrderPage() {
  const { productId = '' } = useParams<{ productId: string }>();
  return <Navigate to={UUID_RE.test(productId) ? '/farm-fresh/' + productId : '/farm-fresh'} replace />;
}
// BAMBEH_END_TOKEN__FARMFRESHORDER_FIX868__COMPLETE
