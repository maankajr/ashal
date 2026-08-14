import { useParams } from "react-router-dom";
import VendorProductForm from "./VendorProductForm";

function EditProduct() {
  const { id } = useParams();
  return <VendorProductForm mode="edit" productId={id} />;
}

export default EditProduct;
