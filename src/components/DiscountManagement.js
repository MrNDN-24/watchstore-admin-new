import React, { useEffect, useState, useRef } from "react";
import { Editor } from "@tinymce/tinymce-react";
import {
  getDiscounts,
  createDiscount,
  updateDiscount,
  deleteDiscount,
} from "../services/discountServicesAdmin";
import {
  FaEdit,
  FaTrashAlt,
  FaPlusCircle,
  FaLockOpen,
  FaLock,
  FaEye,
  FaImage,
} from "react-icons/fa";
import "../styles/DiscountManagement.css";
import Pagination from "../components/Pagination";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const DiscountManagement = () => {
  const editorRef = useRef(null);

  const [discounts, setDiscounts] = useState([]);
  const [newDiscount, setNewDiscount] = useState({
    programName: "",
    image: null,
    code: "",
    description: "",
    discountValue: 0,
    expirationDate: "",
    startDate: "",
    applicableRanks: "bronze",
    //applicableRanks: ["bronze"],
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDiscountId, setCurrentDiscountId] = useState(null);

  // Phân Trang
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const itemsPerPage = 5;
  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= totalPages) {
      setCurrentPage(newPage);
    }
  };
  //Xử lý search
  const [search, setSearch] = useState("");
  useEffect(() => {
    getDiscounts(currentPage, itemsPerPage, search)
      .then((data) => {
        setDiscounts(data.discounts);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Lỗi khi lấy thương hiệu:", error));
  }, [currentPage, search]);

  const fetchData = (page) => {
    getDiscounts(page, itemsPerPage)
      .then((data) => {
        setDiscounts(data.discounts);
        setCurrentPage(data.page);
        setTotalPages(data.totalPages);
      })
      .catch((error) => console.error("Lỗi khi lấy thương hiệu:", error));
  };

  useEffect(() => {
    fetchData(currentPage);
  }, [currentPage]);

  const extractFirstImageFromContent = (htmlContent) => {
    if (!htmlContent) return null;

    // Tạo một DOM parser để phân tích HTML
    const parser = new DOMParser();
    const doc = parser.parseFromString(htmlContent, "text/html");

    // Tìm thẻ img đầu tiên
    const firstImg = doc.querySelector("img");

    if (firstImg) {
      return firstImg.getAttribute("src");
    }

    return null;
  };
  const handleAddDiscount = async () => {
    const isDuplicate = discounts.some(
      (discount) =>
        discount.code.toLowerCase() === newDiscount.code.toLowerCase()
    );

    if (isDuplicate) {
      toast.error("Mã giảm giá đã tồn tại!");
      return;
    }

    const formData = new FormData();
    formData.append("programName", newDiscount.programName);
    formData.append("code", newDiscount.code);
    formData.append("description", newDiscount.description);
    formData.append("discountValue", newDiscount.discountValue);
    formData.append("startDate", newDiscount.startDate);
    formData.append("expirationDate", newDiscount.expirationDate);
    formData.append(
      "applicableRanks",
      JSON.stringify(newDiscount.applicableRanks)
    );

    // Nếu không có ảnh upload, thử lấy ảnh từ nội dung
    if (!newDiscount.image) {
      const firstImageUrl = extractFirstImageFromContent(
        newDiscount.description
      );
      if (firstImageUrl) {
        // Chuyển URL ảnh thành Blob để upload
        try {
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "content-image.jpg", {
            type: blob.type,
          });
          formData.append("image", file);
        } catch (error) {
          console.error("Lỗi khi chuyển đổi ảnh từ nội dung:", error);
        }
      }
    } else {
      formData.append("image", newDiscount.image);
    }

    try {
      await createDiscount(formData);
      fetchData(currentPage);
      setNewDiscount({
        programName: "",
        image: null,
        code: "",
        description: "",
        discountValue: 0,
        expirationDate: "",
        startDate: "",
        applicableRanks: "bronze",
      });
      setIsModalOpen(false);
      toast.success("Mã giảm giá đã được thêm thành công!");
    } catch (error) {
      console.error("Lỗi khi thêm mã giảm giá:", error);
      toast.error("Có lỗi xảy ra khi thêm mã giảm giá.");
    }
  };

  const handleUpdateDiscount = async () => {
    const isDuplicate = discounts.some(
      (discount) =>
        discount.code.toLowerCase() === newDiscount.code.toLowerCase() &&
        discount._id !== currentDiscountId
    );

    if (isDuplicate) {
      toast.error("Mã giảm giá đã tồn tại!");
      return;
    }

    const formData = new FormData();
    formData.append("programName", newDiscount.programName);
    formData.append("description", newDiscount.description);
    formData.append("discountValue", newDiscount.discountValue);
    formData.append("startDate", newDiscount.startDate);
    formData.append("expirationDate", newDiscount.expirationDate);
    formData.append(
      "applicableRanks",
      JSON.stringify(newDiscount.applicableRanks)
    );

    // Xử lý ảnh tương tự như khi thêm mới
    if (!newDiscount.image) {
      const firstImageUrl = extractFirstImageFromContent(
        newDiscount.description
      );
      if (firstImageUrl) {
        try {
          const response = await fetch(firstImageUrl);
          const blob = await response.blob();
          const file = new File([blob], "content-image.jpg", {
            type: blob.type,
          });
          formData.append("image", file);
        } catch (error) {
          console.error("Lỗi khi chuyển đổi ảnh từ nội dung:", error);
        }
      } else if (currentDiscountId) {
        const discount = discounts.find((d) => d._id === currentDiscountId);
        if (discount?.programImage) {
          formData.append("image", discount.programImage);
        }
      }
    } else {
      formData.append("image", newDiscount.image);
    }

    try {
      await updateDiscount(newDiscount.code, formData);
      toast.success("Cập nhật mã giảm giá thành công!");
      setIsModalOpen(false);
      setNewDiscount({
        programName: "",
        image: null,
        code: "",
        description: "",
        discountValue: 0,
        expirationDate: "",
        startDate: "",
        applicableRanks: "bronze",
      });
      fetchData(currentPage);
    } catch (error) {
      console.error("Lỗi khi cập nhật mã giảm giá:", error);
      toast.error("Có lỗi xảy ra khi cập nhật mã giảm giá.");
    }
  };

  // const handleAddDiscount = async () => {
  //   console.log("Adding new discount:", newDiscount);

  //   const isDuplicate = discounts.some(
  //     (discount) =>
  //       discount.code.toLowerCase() === newDiscount.code.toLowerCase()
  //   );

  //   if (isDuplicate) {
  //     toast.error("Mã giảm giá đã tồn tại!");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("programName", newDiscount.programName);
  //   formData.append("code", newDiscount.code);
  //   formData.append("description", newDiscount.description);
  //   formData.append("discountValue", newDiscount.discountValue);
  //   formData.append("startDate", newDiscount.startDate);
  //   formData.append("expirationDate", newDiscount.expirationDate);
  //   //formData.append("applicableRanks", newDiscount.applicableRanks);
  //   formData.append(
  //     "applicableRanks",
  //     JSON.stringify(newDiscount.applicableRanks)
  //   );

  //   if (newDiscount.image) {
  //     formData.append("image", newDiscount.image); // Key này cần trùng tên phía backend
  //   }

  //   try {
  //     await createDiscount(formData);
  //     fetchData(currentPage);
  //     setNewDiscount({
  //       programName: "",
  //       image: null,
  //       code: "",
  //       description: "",
  //       discountValue: 0,
  //       expirationDate: "",
  //       startDate: "",
  //       applicableRanks: "bronze",
  //     });
  //     setIsModalOpen(false);
  //     toast.success("Mã giảm giá đã được thêm thành công!");
  //   } catch (error) {
  //     console.error("Lỗi khi thêm mã giảm giá:", error);
  //     toast.error("Có lỗi xảy ra khi thêm mã giảm giá.");
  //   }
  // };

  // const handleUpdateDiscount = async () => {
  //   // Kiểm tra trùng mã giảm giá
  //   const isDuplicate = discounts.some(
  //     (discount) =>
  //       discount.code.toLowerCase() === newDiscount.code.toLowerCase() &&
  //       discount._id !== currentDiscountId
  //   );

  //   if (isDuplicate) {
  //     toast.error("Mã giảm giá đã tồn tại!");
  //     return;
  //   }

  //   const formData = new FormData();
  //   formData.append("programName", newDiscount.programName);
  //   formData.append("description", newDiscount.description); // Chỉ gửi 1 lần
  //   formData.append("discountValue", newDiscount.discountValue);
  //   formData.append("startDate", newDiscount.startDate);
  //   formData.append("expirationDate", newDiscount.expirationDate);
  //   formData.append(
  //     "applicableRanks",
  //     JSON.stringify(newDiscount.applicableRanks)
  //   );

  //   if (newDiscount.image) {
  //     formData.append("image", newDiscount.image);
  //   } else if (currentDiscountId) {
  //     const discount = discounts.find((d) => d._id === currentDiscountId);
  //     if (discount?.programImage) {
  //       formData.append("image", discount.programImage);
  //     }
  //   }

  //   try {
  //     await updateDiscount(newDiscount.code, formData);
  //     toast.success("Cập nhật mã giảm giá thành công!");
  //     setIsModalOpen(false);
  //     setNewDiscount({
  //       programName: "",
  //       image: null,
  //       code: "",
  //       description: "",
  //       discountValue: 0,
  //       expirationDate: "",
  //       startDate: "",
  //       applicableRanks: "bronze",
  //     });
  //     fetchData(currentPage);
  //   } catch (error) {
  //     console.error("Lỗi khi cập nhật mã giảm giá:", error);
  //     toast.error("Có lỗi xảy ra khi cập nhật mã giảm giá.");
  //   }
  // };

  const handleDeleteDiscount = async (discountId) => {
    const isConfirmed = window.confirm(
      "Bạn có chắc chắn muốn xóa mã giảm giá này?"
    );
    if (isConfirmed) {
      try {
        const code = discounts.find(
          (discount) => discount._id === discountId
        ).code;
        await deleteDiscount(code); // Gửi 'code' thay vì 'discountId'
        setDiscounts(
          discounts.filter((discount) => discount._id !== discountId)
        );
        toast.success("Xóa mã giảm giá thành công!");
      } catch (error) {
        console.error("Lỗi khi xóa mã giảm giá", error);
        toast.error("Có lỗi xảy ra khi xóa mã giảm giá.");
      }
    }
  };

  const handleToggleActive = (discountId) => {
    const updatedDiscount = discounts.find(
      (discount) => discount._id === discountId
    );

    if (updatedDiscount) {
      const code = updatedDiscount.code;
      const newStatus = !updatedDiscount.isActive;

      updateDiscount(code, { isActive: newStatus })
        .then(() => {
          setDiscounts(
            discounts.map((discount) =>
              discount._id === discountId
                ? { ...discount, isActive: newStatus }
                : discount
            )
          );
          toast.success(
            `Trạng thái đã được ${newStatus ? "mở" : "khóa"} thành công!`
          );
        })
        .catch((error) => {
          console.error("Lỗi khi cập nhật trạng thái:", error);
          toast.error("Có lỗi xảy ra khi cập nhật trạng thái.");
        });
    }
  };

  const openModalForAdd = () => {
    setNewDiscount({
      programName: "",
      image: null,
      code: "",
      description: "",
      discountValue: 0,
      expirationDate: "",
      startDate: "",
      applicableRanks: "bronze",
    });
    setCurrentDiscountId(null);
    setIsModalOpen(true);
  };

  const openModalForEdit = (discount) => {
    // Đảm bảo expirationDate có định dạng đúng
    const expirationDate = discount.expirationDate
      ? new Date(discount.expirationDate).toISOString().split("T")[0]
      : "";
    const startDate = discount.startDate
      ? new Date(discount.startDate).toISOString().split("T")[0]
      : "";

    setNewDiscount({
      programName: discount.programName,
      image: discount.programImage, // đây là string URL
      code: discount.code,
      description: discount.description,
      discountValue: discount.discountValue,
      expirationDate: expirationDate,
      startDate: startDate,
      applicableRanks: discount.applicableRanks,
    });

    setCurrentDiscountId(discount._id);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };
  const handleSearchChange = (event) => {
    setSearch(event.target.value);
    setCurrentPage(1);
  };
  const handleImageUpload = (e) => {
    setNewDiscount({ ...newDiscount, image: e.target.files[0] });
  };
  const rankLabels = {
    bronze: "Đồng",
    silver: "Bạc",
    gold: "Vàng",
    platinum: "Bạch Kim",
    diamond: "Kim Cương",
  };

  const getRanksDisplay = (ranks) => {
    let ranksArray = [];

    if (Array.isArray(ranks)) {
      ranksArray = ranks;
    } else if (typeof ranks === "string") {
      try {
        ranksArray = JSON.parse(ranks);
        if (!Array.isArray(ranksArray)) {
          ranksArray = [ranks];
        }
      } catch {
        ranksArray = [ranks];
      }
    }

    return ranksArray.map((rank) => rankLabels[rank] || rank).join(", ");
  };

  // Seen discount
  const [viewDiscount, setViewDiscount] = useState(null);
  const openViewModal = (Discount) => {
    setViewDiscount(Discount);
  };
  const closeViewModal = () => {
    setViewDiscount(null);
  };
  return (
    <div className="discount-admin">
      <div className="discount-header">
        <h1>Quản Lý Mã Giảm Giá</h1>
        <input
          type="text"
          placeholder="Tìm kiếm..."
          className="discount-search"
          onChange={handleSearchChange}
        />
        <button onClick={openModalForAdd} className="add-discount-btn">
          <FaPlusCircle /> Thêm Mới Mã Giảm Giá
        </button>
      </div>

      <div className="discount-table">
        <table>
          <thead>
            <tr>
              <th>Tên Chương Trình</th>
              <th>Ảnh</th>
              <th>Mã Giảm Giá</th>
              <th>Hạng áp dụng</th>
              <th>Giảm Giá</th>
              <th>Ngày Tạo</th>
              <th>Ngày Hết Hạn</th>
              <th>Hành Động</th>
            </tr>
          </thead>
          <tbody>
            {discounts.map((discount) => (
              <tr key={discount._id}>
                <td>{discount.programName}</td>
                {/* <td>
                  {discount.programImage && (
                    <img
                      src={discount.programImage}
                      alt="Ảnh CT"
                      style={{ width: "60px", height: "auto" }}
                    />
                  )}
                </td> */}
                <td>
                  {discount.programImage ? (
                    <img
                      src={discount.programImage}
                      alt="Ảnh CT"
                      style={{ width: "80px", height: "auto" }}
                    />
                  ) : (
                    extractFirstImageFromContent(discount.description) && (
                      <img
                        src={extractFirstImageFromContent(discount.description)}
                        alt="Ảnh từ nội dung"
                        style={{ width: "80px", height: "auto" }}
                      />
                    )
                  )}
                </td>
                <td>{discount.code}</td>
                <td>{getRanksDisplay(discount.applicableRanks)}</td>
                <td>
                  {new Intl.NumberFormat("vi-VN", {
                    style: "currency",
                    currency: "VND",
                  }).format(discount.discountValue)}
                </td>

                <td>{new Date(discount.startDate).toLocaleDateString()}</td>
                <td>
                  {new Date(discount.expirationDate).toLocaleDateString()}
                </td>
                <td>
                  <div className="discount-actions">
                    <button
                      className="seen-btn-discount"
                      onClick={() => openViewModal(discount)}
                    >
                      <span className="icon-blog">
                        {" "}
                        <FaEye />
                      </span>
                    </button>
                    <button
                      className="edit-btn-discount"
                      onClick={() => openModalForEdit(discount)}
                    >
                      <span className="icon-discount">
                        <FaEdit />
                      </span>
                    </button>
                    <button
                      className="delete-btn-discount"
                      onClick={() => handleDeleteDiscount(discount._id)}
                    >
                      <span className="icon-discount">
                        <FaTrashAlt />
                      </span>
                    </button>
                    <button
                      onClick={() => handleToggleActive(discount._id)}
                      className="active-btn-discount"
                    >
                      {discount.isActive ? (
                        <span className="icon-discount">
                          <FaLockOpen />
                        </span>
                      ) : (
                        <span className="icon-discount">
                          <FaLock />
                        </span>
                      )}
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={handlePageChange}
      />
      {isModalOpen && (
        <div className="modal-box-discount">
          <div className="modal-content-discount">
            <button className="close-btn-discount" onClick={closeModal}>
              x
            </button>
            <h2>
              {currentDiscountId
                ? "Cập Nhật Mã Giảm Giá"
                : "Thêm Mới Mã Giảm Giá"}
            </h2>

            <div className="modal-form-split">
              {/* LEFT SIDE: INPUT FIELDS */}
              <div className="modal-form-left">
                <input
                  type="text"
                  placeholder="Tên chương trình"
                  value={newDiscount.programName}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      programName: e.target.value,
                    })
                  }
                />
                <input
                  type="text"
                  placeholder="Mã Giảm Giá"
                  value={newDiscount.code}
                  onChange={(e) =>
                    setNewDiscount({ ...newDiscount, code: e.target.value })
                  }
                  disabled={currentDiscountId !== null}
                />
                {/* {(currentDiscountId && currentDiscountId.programImage) ||
                newDiscount.image ? (
                  <div className="image-preview">
                    <p>Ảnh:</p>
                    <img
                      src={
                        newDiscount.image
                          ? URL.createObjectURL(newDiscount.image)
                          : currentDiscountId.programImage
                      }
                      alt="Ảnh minh họa"
                      width="100"
                    />
                  </div>
                ) : null} */}
                {/* {newDiscount.image && (
                  <div className="image-preview">
                    <p>Ảnh:</p>
                    <img
                      src={
                        newDiscount.image instanceof File
                          ? URL.createObjectURL(newDiscount.image)
                          : newDiscount.image
                      }
                      alt="Ảnh minh họa"
                      width="100"
                    />
                  </div>
                )} */}
                {newDiscount.image ? (
                  <div className="image-preview">
                    <p>Ảnh:</p>
                    <img
                      src={
                        newDiscount.image instanceof File
                          ? URL.createObjectURL(newDiscount.image)
                          : newDiscount.image
                      }
                      alt="Ảnh minh họa"
                      className="preview-image"
                    />
                  </div>
                ) : extractFirstImageFromContent(newDiscount.description) ? (
                  <div className="image-preview">
                    <p>Ảnh từ nội dung:</p>
                    <img
                      src={extractFirstImageFromContent(
                        newDiscount.description
                      )}
                      alt="Ảnh từ nội dung"
                      className="preview-image"
                    />
                  </div>
                ) : null}

                <label htmlFor="discount-image-upload" className="upload-button">
                              <FaImage className="upload-icon" />
                              Chọn ảnh
                            </label>
                            <input
                              id="discount-image-upload"
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              style={{ display: "none" }}
                            />
                <label>Số tiền giảm:</label>
                <input
                  type="number"
                  placeholder="Giảm Giá (VND)"
                  value={newDiscount.discountValue}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      discountValue: e.target.value,
                    })
                  }
                />
                <label>Hạng áp dụng:</label>
                <select
                  value={newDiscount.applicableRanks}
                  onChange={(e) =>
                    setNewDiscount({
                      ...newDiscount,
                      applicableRanks: e.target.value,
                    })
                  }
                >
                  <option value="bronze">Đồng</option>
                  <option value="silver">Bạc</option>
                  <option value="gold">Vàng</option>
                  <option value="platinum">Bạch Kim</option>
                  <option value="diamond">Kim Cương</option>
                </select>

                <div className="modal-date">
                  <div>
                    <label>Ngày bắt đầu:</label>
                    <input
                      className="modal-dateStart"
                      type="date"
                      value={newDiscount.startDate}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          startDate: e.target.value,
                        })
                      }
                    />
                  </div>
                  <div>
                    <label>Ngày hết hạn:</label>
                    <input
                      className="modal-dateEnd"
                      type="date"
                      value={newDiscount.expirationDate}
                      onChange={(e) =>
                        setNewDiscount({
                          ...newDiscount,
                          expirationDate: e.target.value,
                        })
                      }
                    />
                  </div>
                </div>
              </div>

              {/* RIGHT SIDE: DESCRIPTION ONLY */}
              <div className="modal-form-right">
                <label>Mô tả chương trình:</label>
                <Editor
                  apiKey={process.env.REACT_APP_API_TINYMCE}
                  onInit={(evt, editor) => (editorRef.current = editor)}
                  value={newDiscount.description}
                  init={{
                    plugins: [
                      "anchor",
                      "autolink",
                      "charmap",
                      "codesample",
                      "emoticons",
                      "image",
                      "link",
                      "lists",
                      "media",
                      "searchreplace",
                      "table",
                      "visualblocks",
                      "wordcount",
                      "checklist",
                      "mediaembed",
                      "casechange",
                      "formatpainter",
                      "pageembed",
                      "a11ychecker",
                      "tinymcespellchecker",
                      "permanentpen",
                      "powerpaste",
                      "advtable",
                      "advcode",
                      "editimage",
                      "advtemplate",
                      "ai",
                      "mentions",
                      "tinycomments",
                      "tableofcontents",
                      "footnotes",
                      "mergetags",
                      "autocorrect",
                      "typography",
                      "inlinecss",
                      "markdown",
                      "importword",
                      "exportword",
                      "exportpdf",
                    ],
                    toolbar:
                      "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | " +
                      "link image media table mergetags | addcomment showcomments | spellcheckdialog " +
                      "a11ycheck typography | align lineheight | checklist numlist bullist indent outdent | " +
                      "emoticons charmap | removeformat",
                    tinycomments_mode: "embedded",
                    tinycomments_author: "Author name",
                    mergetags_list: [
                      { value: "First.Name", title: "First Name" },
                      { value: "Email", title: "Email" },
                    ],
                    ai_request: (request, respondWith) =>
                      respondWith.string(() =>
                        Promise.reject("See docs to implement AI Assistant")
                      ),
                    height: 400,
                    menubar: false,
                    content_style:
                      "body { font-family:Helvetica,Arial,sans-serif; font-size:14px }",
                  }}
                  onEditorChange={(content) => {
                    setNewDiscount({
                      ...newDiscount,
                      description: content,
                    });
                  }}
                />
              </div>
            </div>

            <div className="modal-buttons">
              <button
                onClick={
                  currentDiscountId ? handleUpdateDiscount : handleAddDiscount
                }
                className="submit-btn-discount"
              >
                {currentDiscountId ? "Cập Nhật" : "Thêm"}
              </button>
            </div>
          </div>
        </div>
      )}
      {viewDiscount && (
        <div className="modal-box-discount">
          <div className="modal-content-discount discount-view-modal">
            <button className="close-btn-discount" onClick={closeViewModal}>
              x
            </button>
            <h2>{viewDiscount.programName}</h2>

            <div className="discount-meta">
              <div>
                <strong>Mã giảm giá:</strong> {viewDiscount.code}
              </div>
              <div>
                <strong>Giá trị:</strong>{" "}
                {new Intl.NumberFormat("vi-VN", {
                  style: "currency",
                  currency: "VND",
                }).format(viewDiscount.discountValue)}
              </div>
              <div>
                <strong>Hạng áp dụng:</strong>{" "}
                {getRanksDisplay(viewDiscount.applicableRanks)}
              </div>
              <div>
                <strong>Ngày bắt đầu:</strong>{" "}
                {new Date(viewDiscount.startDate).toLocaleDateString()}
              </div>
              <div>
                <strong>Ngày hết hạn:</strong>{" "}
                {new Date(viewDiscount.expirationDate).toLocaleDateString()}
              </div>
            </div>

            {viewDiscount.programImage ||
            extractFirstImageFromContent(viewDiscount.description) ? (
              <img
                src={
                  viewDiscount.programImage ||
                  extractFirstImageFromContent(viewDiscount.description)
                }
                alt="Ảnh chương trình"
                className="discount-view-image"
              />
            ) : null}

            <div className="discount-view-content">
              <h3>Mô tả chương trình</h3>
              <div
                dangerouslySetInnerHTML={{ __html: viewDiscount.description }}
              ></div>
            </div>
          </div>
        </div>
      )}

      <ToastContainer />
    </div>
  );
};

export default DiscountManagement;
