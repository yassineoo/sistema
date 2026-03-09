"use client";

import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Edit2, Trash2, BookOpen, ChevronDown, ChevronUp, Check, X, ExternalLink, Upload } from "lucide-react";
import { toast } from "sonner";
import { useGetCatalogs, useCreateCatalog, useUpdateCatalog, useDeleteCatalog } from "@/hooks/catalogs";
import { TableSkeleton } from "@/components/shared/loading-skeleton";
import type { Catalog } from "@/types/api";

function DeleteDialog({
  onConfirm,
  onCancel,
  loading,
}: {
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.92, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="mx-4 w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl"
      >
        <h3 className="text-base font-semibold text-secondary-900">Supprimer ce catalogue ?</h3>
        <div className="mt-5 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="rounded-xl bg-red-500 px-4 py-2 text-sm font-medium text-white hover:bg-red-600 disabled:opacity-60"
          >
            {loading ? "..." : "Confirmer"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

interface EditRowProps {
  catalog: Catalog;
  onSave: (id: number, fd: FormData) => Promise<void>;
  onCancel: () => void;
  isPending: boolean;
}

function EditRow({ catalog, onSave, onCancel, isPending }: EditRowProps) {
  const [name, setName] = useState(catalog.name);
  const [link, setLink] = useState(catalog.pdf_drive_link);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState(catalog.cover_image ?? "");
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCoverFile(f);
    setCoverPreview(URL.createObjectURL(f));
  }

  async function handleSave() {
    if (!name.trim() || !link.trim()) return;
    const fd = new FormData();
    fd.append("name", name.trim());
    fd.append("pdf_drive_link", link.trim());
    if (coverFile) fd.append("cover_image", coverFile);
    await onSave(catalog.id, fd);
  }

  return (
    <tr className="bg-primary-50/50">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <div
            className="h-10 w-10 shrink-0 cursor-pointer overflow-hidden rounded-lg border border-secondary-200"
            onClick={() => fileRef.current?.click()}
          >
            {coverPreview ? (
              <img src={coverPreview} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-secondary-100">
                <Upload size={14} className="text-secondary-400" />
              </div>
            )}
          </div>
          <input ref={fileRef} type="file" accept="image/*" onChange={handleFile} className="hidden" />
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            autoFocus
            className="h-8 flex-1 rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500"
          />
        </div>
      </td>
      <td className="px-4 py-3">
        <input
          type="url"
          value={link}
          onChange={(e) => setLink(e.target.value)}
          placeholder="https://drive.google.com/..."
          className="h-8 w-full rounded-lg border border-secondary-200 px-2 text-sm outline-none focus:border-primary-500"
        />
      </td>
      <td className="px-4 py-3 text-xs text-secondary-400">—</td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={handleSave}
            disabled={isPending}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white hover:bg-primary-700 disabled:opacity-60"
          >
            <Check size={14} />
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-secondary-200 text-secondary-500 hover:bg-secondary-50"
          >
            <X size={14} />
          </button>
        </div>
      </td>
    </tr>
  );
}

export default function CatalogsPage() {
  const [createOpen, setCreateOpen] = useState(false);
  const [createName, setCreateName] = useState("");
  const [createLink, setCreateLink] = useState("");
  const [createCoverFile, setCreateCoverFile] = useState<File | null>(null);
  const [createCoverPreview, setCreateCoverPreview] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [deleteId, setDeleteId] = useState<number | null>(null);
  const createFileRef = useRef<HTMLInputElement>(null);

  const { data, isLoading, isError } = useGetCatalogs();
  const createCatalog = useCreateCatalog();
  const updateCatalog = useUpdateCatalog();
  const deleteCatalog = useDeleteCatalog();

  const catalogs = data?.results ?? [];

  function handleCreateFile(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0];
    if (!f) return;
    setCreateCoverFile(f);
    setCreateCoverPreview(URL.createObjectURL(f));
  }

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!createName.trim() || !createLink.trim()) return;
    const fd = new FormData();
    fd.append("name", createName.trim());
    fd.append("pdf_drive_link", createLink.trim());
    if (createCoverFile) fd.append("cover_image", createCoverFile);
    try {
      await createCatalog.mutateAsync(fd);
      toast.success("Catalogue créé");
      setCreateName("");
      setCreateLink("");
      setCreateCoverFile(null);
      setCreateCoverPreview("");
      setCreateOpen(false);
    } catch {
      toast.error("Erreur lors de la création");
    }
  }

  async function handleUpdate(id: number, fd: FormData) {
    try {
      await updateCatalog.mutateAsync({ id, payload: fd });
      toast.success("Catalogue mis à jour");
      setEditingId(null);
    } catch {
      toast.error("Erreur lors de la mise à jour");
    }
  }

  async function handleDelete() {
    if (deleteId == null) return;
    try {
      await deleteCatalog.mutateAsync(deleteId);
      toast.success("Catalogue supprimé");
      setDeleteId(null);
    } catch {
      toast.error("Erreur lors de la suppression");
    }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-secondary-900">Catalogues</h1>
          <p className="mt-1 text-sm text-secondary-500">Gérer les catalogues PDF</p>
        </div>
        <button
          type="button"
          onClick={() => setCreateOpen((v) => !v)}
          className="inline-flex items-center gap-2 rounded-xl bg-primary-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-primary-700"
        >
          {createOpen ? <ChevronUp size={16} /> : <Plus size={16} />}
          Nouveau catalogue
        </button>
      </div>

      {/* Create form */}
      <AnimatePresence>
        {createOpen && (
          <motion.div
            key="create-form"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <form
              onSubmit={handleCreate}
              className="rounded-2xl border border-primary-100 bg-primary-50/30 p-5 shadow-sm space-y-4"
            >
              <h2 className="text-base font-semibold text-secondary-900">Nouveau catalogue</h2>
              <div className="flex items-start gap-4">
                {/* Cover image */}
                <div
                  className="h-24 w-24 shrink-0 cursor-pointer overflow-hidden rounded-xl border-2 border-dashed border-secondary-200 hover:border-primary-400"
                  onClick={() => createFileRef.current?.click()}
                >
                  {createCoverPreview ? (
                    <img src={createCoverPreview} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <div className="flex h-full w-full flex-col items-center justify-center gap-1">
                      <Upload size={16} className="text-secondary-400" />
                      <span className="text-[10px] text-secondary-400">Couverture</span>
                    </div>
                  )}
                </div>
                <input ref={createFileRef} type="file" accept="image/*" onChange={handleCreateFile} className="hidden" />
                <div className="flex-1 space-y-3">
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-secondary-700">Nom *</label>
                    <input
                      type="text"
                      value={createName}
                      onChange={(e) => setCreateName(e.target.value)}
                      placeholder="ex. Catalogue Printemps 2025"
                      required
                      className="h-9 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                  <div>
                    <label className="mb-1 block text-sm font-semibold text-secondary-700">Lien PDF (Google Drive) *</label>
                    <input
                      type="url"
                      value={createLink}
                      onChange={(e) => setCreateLink(e.target.value)}
                      placeholder="https://drive.google.com/..."
                      required
                      className="h-9 w-full rounded-xl border border-secondary-200 px-3 text-sm outline-none focus:border-primary-500 focus:ring-2 focus:ring-primary-100"
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreateOpen(false)}
                  className="rounded-xl border border-secondary-200 px-4 py-2 text-sm font-medium text-secondary-600 hover:bg-secondary-50"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createCatalog.isPending}
                  className="rounded-xl bg-primary-600 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-700 disabled:opacity-60"
                >
                  {createCatalog.isPending ? "Enregistrement..." : "Enregistrer"}
                </button>
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-secondary-100 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-secondary-100 bg-secondary-50/50">
              <tr>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">Nom</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">Lien PDF</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">Date</th>
                <th className="px-4 py-3 text-left font-semibold text-secondary-500">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-secondary-50">
              {isLoading ? (
                <TableSkeleton rows={4} cols={4} />
              ) : isError ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-red-500">
                    Impossible de charger les catalogues
                  </td>
                </tr>
              ) : catalogs.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-sm text-secondary-400">
                    Aucun catalogue
                  </td>
                </tr>
              ) : (
                catalogs.map((cat) =>
                  editingId === cat.id ? (
                    <EditRow
                      key={cat.id}
                      catalog={cat}
                      onSave={handleUpdate}
                      onCancel={() => setEditingId(null)}
                      isPending={updateCatalog.isPending}
                    />
                  ) : (
                    <motion.tr
                      key={cat.id}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="hover:bg-secondary-50/50"
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {cat.cover_image ? (
                            <img src={cat.cover_image} alt={cat.name} className="h-10 w-10 rounded-lg object-cover border border-secondary-100" />
                          ) : (
                            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
                              <BookOpen size={16} />
                            </div>
                          )}
                          <span className="font-medium text-secondary-900">{cat.name}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <a
                          href={cat.pdf_drive_link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary-600 hover:underline text-xs"
                        >
                          <ExternalLink size={12} />
                          Ouvrir PDF
                        </a>
                      </td>
                      <td className="px-4 py-3 text-xs text-secondary-400">
                        {new Date(cat.created_at).toLocaleDateString("fr-DZ")}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => setEditingId(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-secondary-500 hover:bg-secondary-100 hover:text-secondary-700"
                          >
                            <Edit2 size={14} />
                          </button>
                          <button
                            type="button"
                            onClick={() => setDeleteId(cat.id)}
                            className="flex h-8 w-8 items-center justify-center rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </motion.tr>
                  )
                )
              )}
            </tbody>
          </table>
        </div>
      </div>

      {deleteId != null && (
        <DeleteDialog
          onConfirm={handleDelete}
          onCancel={() => setDeleteId(null)}
          loading={deleteCatalog.isPending}
        />
      )}
    </div>
  );
}
