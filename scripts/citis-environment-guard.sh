normalize_citis_environment() {
  local value="${CITIS_ENVIRONMENT:-}"
  value="${value,,}"
  value="${value#"${value%%[![:space:]]*}"}"
  value="${value%"${value##*[![:space:]]}"}"
  printf '%s' "$value"
}

validate_data_transfer_environment() {
  local configured_environment
  configured_environment="$(normalize_citis_environment)"

  if [[ "${NODE_ENV:-}" == "production" || "${REPLIT_DEPLOYMENT:-}" == "1" ]]; then
    echo "This data-transfer script is disabled in production runtimes." >&2
    return 1
  fi

  case "$configured_environment" in
    ""|development)
      return 0
      ;;
    staging)
      echo "This production data-transfer script is disabled in staging mode." >&2
      return 1
      ;;
    production)
      echo "This data-transfer script cannot use the production application environment." >&2
      return 1
      ;;
    *)
      echo "CITIS_ENVIRONMENT must be development, staging, or production." >&2
      return 1
      ;;
  esac
}
